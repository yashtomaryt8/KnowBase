from django.contrib import admin
from django.conf import settings
from django.conf.urls.static import static
from django.urls import include, path

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/topics/', include('apps.topics.urls')),
    path('api/pages/', include('apps.pages.urls')),
    path('api/search/', include('apps.search.urls')),
    path('api/export/', include('apps.export.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
