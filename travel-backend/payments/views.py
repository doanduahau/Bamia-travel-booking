from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework import status
from .models import Transaction
from bookings.models import Booking, Cart
from decimal import Decimal
import hashlib

class CreatePaymentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        cart_item_ids = request.data.get('cart_item_ids', [])
        payment_method = request.data.get('payment_method', 'vnpay')

        if not cart_item_ids:
            return Response({'error': 'Không có tour nào được chọn'}, status=status.HTTP_400_BAD_REQUEST)

        # Lấy các item trong giỏ hàng
        cart_items = Cart.objects.filter(id__in=cart_item_ids, user=request.user)
        if not cart_items.exists():
            return Response({'error': 'Giỏ hàng không hợp lệ'}, status=status.HTTP_400_BAD_REQUEST)

        total_amount = Decimal(0)
        new_bookings = []

        # Chuyển Cart -> Booking (trạng thái Pending)
        for item in cart_items:
            price = item.tour.price * item.number_of_people
            total_amount += price
            
            # Tạo Booking mới với trạng thái Pending
            booking = Booking.objects.create(
                user=request.user,
                tour=item.tour,
                date=item.date or '2026-01-01',
                number_of_people=item.number_of_people,
                total_price=price,
                status='Pending'
            )
            new_bookings.append(booking)
            
        # KHÔNG xóa cart items ở đây - chỉ xóa sau khi thanh toán thành công (trong webhook)

        # Tạo Transaction - lưu lại cart_item_ids để xóa sau
        transaction = Transaction.objects.create(
            user=request.user,
            amount=total_amount,
            payment_method=payment_method,
            status='Pending',
            cart_item_ids=list(cart_item_ids)  # Lưu để webhook biết cần xóa cart nào
        )
        transaction.bookings.set(new_bookings)

        # Trả về transaction_id cho Frontend mở Sandbox
        return Response({
            'message': 'Khởi tạo thanh toán thành công',
            'transaction_id': transaction.id,
            'total_amount': total_amount,
            'payment_method': payment_method
        })

class WebhookIPNView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        transaction_id = request.data.get('transaction_id')
        status_code = request.data.get('status')

        try:
            transaction = Transaction.objects.get(id=transaction_id)
        except Transaction.DoesNotExist:
            return Response({'error': 'Giao dịch không tồn tại'}, status=status.HTTP_404_NOT_FOUND)

        if status_code == 'success':
            transaction.status = 'Success'
            transaction.save()
            
            # Cập nhật tất cả booking của transaction này sang Paid
            transaction.bookings.all().update(status='Paid')
            
            # Xóa cart items sau khi thanh toán thành công
            Cart.objects.filter(id__in=transaction.cart_item_ids).delete()
            
            return Response({'message': 'IPN Processed: Cập nhật thành công sang Paid'})
        else:
            transaction.status = 'Failed'
            transaction.save()
            # Khi hủy/thất bại → Cancel các Booking nhưng GIỮ LẠI cart items
            transaction.bookings.all().update(status='Cancelled')
            return Response({'message': 'IPN Processed: Giao dịch thất bại'})


class RetryPaymentView(APIView):
    """API để thanh toán lại các Booking đang Pending (không cần Cart)"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        booking_ids = request.data.get('booking_ids', [])
        payment_method = request.data.get('payment_method', 'vnpay')

        if not booking_ids:
            return Response({'error': 'Không có đơn hàng nào được chọn'}, status=status.HTTP_400_BAD_REQUEST)

        # Chỉ lấy Pending bookings của user
        bookings = Booking.objects.filter(id__in=booking_ids, user=request.user, status='Pending')
        if not bookings.exists():
            return Response({'error': 'Không tìm thấy đơn hàng Pending hợp lệ'}, status=status.HTTP_400_BAD_REQUEST)

        total_amount = sum(b.total_price for b in bookings)

        # Tạo Transaction mới liên kết với các booking đang chờ
        transaction = Transaction.objects.create(
            user=request.user,
            amount=total_amount,
            payment_method=payment_method,
            status='Pending',
            cart_item_ids=[]  # Không có cart items, giỏ hàng đã xử lý trước
        )
        transaction.bookings.set(bookings)

        return Response({
            'message': 'Khởi tạo thanh toán lại thành công',
            'transaction_id': transaction.id,
            'total_amount': float(total_amount),
            'payment_method': payment_method
        })
