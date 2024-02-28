from django.shortcuts import render

# Create your views here.

# def index(request):
# 	return render(request, 'index/index_en.html')


from django.shortcuts import render
from django.utils.translation import get_language

def index(request):
    current_language = get_language()
    print(f"Current language: {current_language}")
    
    template_name = f'index/index_{current_language}.html'
    return render(request, template_name)
