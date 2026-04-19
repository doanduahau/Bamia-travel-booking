from django import forms
from tours.models import Tour

class TourForm(forms.ModelForm):
    class Meta:
        model = Tour
        fields = ['title', 'description', 'category', 'location', 'price', 'duration', 'image', 'available_slots']
        widgets = {
            'title': forms.TextInput(attrs={
                'class': 'w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#005555] focus:border-transparent outline-none transition-all mr-6',
                'placeholder': 'Nhập tên tour du lịch...'
            }),
            'description': forms.Textarea(attrs={
                'class': 'w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#005555] focus:border-transparent outline-none transition-all h-32',
                'placeholder': 'Mô tả chi tiết về lịch trình, điểm nhấn của tour...'
            }),
            'category': forms.Select(attrs={
                'class': 'w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#005555] focus:border-transparent outline-none transition-all'
            }),
            'location': forms.Select(attrs={
                'class': 'w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#005555] focus:border-transparent outline-none transition-all'
            }),
            'price': forms.NumberInput(attrs={
                'class': 'w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#005555] focus:border-transparent outline-none transition-all',
                'placeholder': 'Vd: 2500000'
            }),
            'duration': forms.TextInput(attrs={
                'class': 'w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#005555] focus:border-transparent outline-none transition-all',
                'placeholder': 'Vd: 3 ngày 2 đêm'
            }),
            'available_slots': forms.NumberInput(attrs={
                'class': 'w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#005555] focus:border-transparent outline-none transition-all'
            }),
            'image': forms.FileInput(attrs={
                'class': 'w-full px-4 py-2 border border-gray-300 rounded-xl text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100'
            }),
        }
        labels = {
            'title': 'Tiêu đề Tour',
            'description': 'Mô tả chi tiết',
            'category': 'Danh mục',
            'location': 'Địa điểm đến',
            'price': 'Giá tour (VNĐ)',
            'duration': 'Thời gian hành trình',
            'image': 'Ảnh đại diện',
            'available_slots': 'Số chỗ trống'
        }
