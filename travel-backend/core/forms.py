from django import forms
from tours.models import Tour, Category, Destination

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
                'class': 'absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10'
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

class CategoryForm(forms.ModelForm):
    class Meta:
        model = Category
        fields = ['name', 'description']
        widgets = {
            'name': forms.TextInput(attrs={
                'class': 'w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#005555] focus:border-transparent outline-none transition-all',
                'placeholder': 'Nhập tên danh mục...'
            }),
            'description': forms.Textarea(attrs={
                'class': 'w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#005555] focus:border-transparent outline-none transition-all h-32',
                'placeholder': 'Mô tả ngắn về danh mục này...'
            }),
        }
        labels = {
            'name': 'Tên danh mục',
            'description': 'Mô tả'
        }

class DestinationForm(forms.ModelForm):
    class Meta:
        model = Destination
        fields = ['name', 'description']
        widgets = {
            'name': forms.TextInput(attrs={
                'class': 'w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#005555] focus:border-transparent outline-none transition-all',
                'placeholder': 'Nhập tên địa điểm...'
            }),
            'description': forms.Textarea(attrs={
                'class': 'w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#005555] focus:border-transparent outline-none transition-all h-32',
                'placeholder': 'Mô tả chi tiết về địa điểm này...'
            }),
        }
        labels = {
            'name': 'Tên địa điểm',
            'description': 'Mô tả chi tiết'
        }
