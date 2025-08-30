from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Notice
from .serializers import NoticeSerializer
from .models import Gym
from .models import Membership

class NoticeCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if request.user.user_type != 'gym_owner':
            return Response({'error': 'Only gym owners can create notices'}, status=403)
        
        serializer = NoticeSerializer(data=request.data)
        if serializer.is_valid():
            # Verify the gym belongs to the current user
            gym_id = serializer.validated_data['gym'].id
            if not Gym.objects.filter(id=gym_id, owner=request.user).exists():
                return Response({'error': 'You can only create notices for your own gyms'}, status=403)
            
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

class NoticeListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        
        if user.user_type == 'gym_owner':
            # Gym owners see notices for their gyms
            gyms = Gym.objects.filter(owner=user)
            notices = Notice.objects.filter(gym__in=gyms, is_active=True)
        elif user.user_type == 'member':
            # Members see notices for gyms they're members of
            memberships = Membership.objects.filter(member=user, status='approved')
            gym_ids = [membership.gym.id for membership in memberships]
            notices = Notice.objects.filter(gym_id__in=gym_ids, is_active=True)
        else:
            # Admin sees all notices
            notices = Notice.objects.filter(is_active=True)
        
        serializer = NoticeSerializer(notices, many=True)
        return Response(serializer.data)

class NoticeDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, notice_id):
        try:
            notice = Notice.objects.get(id=notice_id, is_active=True)
            serializer = NoticeSerializer(notice)
            return Response(serializer.data)
        except Notice.DoesNotExist:
            return Response({'error': 'Notice not found'}, status=404)

    def put(self, request, notice_id):
        if request.user.user_type != 'gym_owner':
            return Response({'error': 'Only gym owners can update notices'}, status=403)
        
        try:
            notice = Notice.objects.get(id=notice_id)
            # Verify the notice belongs to the current user's gym
            if notice.gym.owner != request.user:
                return Response({'error': 'You can only update notices for your own gyms'}, status=403)
            
            serializer = NoticeSerializer(notice, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=400)
        except Notice.DoesNotExist:
            return Response({'error': 'Notice not found'}, status=404)

    def delete(self, request, notice_id):
        if request.user.user_type != 'gym_owner':
            return Response({'error': 'Only gym owners can delete notices'}, status=403)
        
        try:
            notice = Notice.objects.get(id=notice_id)
            # Verify the notice belongs to the current user's gym
            if notice.gym.owner != request.user:
                return Response({'error': 'You can only delete notices for your own gyms'}, status=403)
            
            notice.delete()
            return Response({'message': 'Notice deleted successfully'}, status=204)
        except Notice.DoesNotExist:
            return Response({'error': 'Notice not found'}, status=404)
