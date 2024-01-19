from django.http import HttpResponse
from django.shortcuts import render

def index(request):
    #  return HttpResponse("Hello, world. This is a test.")
    return render(request, 'game/index.html')
