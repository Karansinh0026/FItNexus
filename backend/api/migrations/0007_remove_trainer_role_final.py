# Generated manually to remove trainer role permanently

from django.db import migrations, models

def convert_trainer_to_member(apps, schema_editor):
    """Convert any existing trainer users to member role"""
    User = apps.get_model('api', 'User')
    # Change any trainer users to member role
    trainer_count = User.objects.filter(role='trainer').count()
    if trainer_count > 0:
        User.objects.filter(role='trainer').update(role='member')
        print(f"Converted {trainer_count} trainer users to member role")

def reverse_convert_trainer_to_member(apps, schema_editor):
    """Reverse migration - no specific action needed"""
    pass

class Migration(migrations.Migration):

    dependencies = [
        ('api', '0006_merge_20250819_1724'),
    ]

    operations = [
        # First, convert any existing trainer users to member role
        migrations.RunPython(convert_trainer_to_member, reverse_convert_trainer_to_member),
        
        # Then update the choices to remove trainer option
        migrations.AlterField(
            model_name='user',
            name='role',
            field=models.CharField(
                choices=[('admin', 'Admin'), ('member', 'Member')],
                default='member',
                max_length=10
            ),
        ),
    ]
