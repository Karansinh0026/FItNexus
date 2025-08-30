
class NoticeSerializer(serializers.ModelSerializer):
    gym_name = serializers.CharField(source='gym.name', read_only=True)
    created_at_formatted = serializers.SerializerMethodField()

    class Meta:
        model = Notice
        fields = ['id', 'gym', 'gym_name', 'title', 'message', 'created_at', 'created_at_formatted', 'is_active']
        read_only_fields = ['created_at', 'created_at_formatted']

    def get_created_at_formatted(self, obj):
        return obj.created_at.strftime('%B %d, %Y at %I:%M %p')

