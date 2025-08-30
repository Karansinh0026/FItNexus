from .views import NoticeCreateView, NoticeListView, NoticeDetailView

urlpatterns = [
    path('notices/', NoticeListView.as_view(), name='notice-list'),
    path('notices/create/', NoticeCreateView.as_view(), name='notice-create'),
    path('notices/<int:notice_id>/', NoticeDetailView.as_view(), name='notice-detail'),
]
