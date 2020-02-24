from django.shortcuts import redirect
from django.views.generic.edit import FormView
from django.views.generic.base import TemplateView
from django.contrib.auth.forms import UserCreationForm
from django.urls import reverse_lazy
from django.contrib.auth import login
from django.contrib.auth.mixins import LoginRequiredMixin


# useless
def index(request):
    if (request.user.is_authenticated):
        return redirect('home')
    return redirect('login')

class UserCreateView(FormView):
    form_class = UserCreationForm
    success_url = reverse_lazy('signup_done')
    template_name = 'registration/user_create.html'
    title = 'Create account'

    def form_valid(self, form):
        user = form.save()
        login(self.request, user)
        return redirect(self.get_success_url())
    

class UserCreateDoneView(LoginRequiredMixin, TemplateView):
    template_name = 'registration/user_create_done.html'
    title = 'Create account complete'
