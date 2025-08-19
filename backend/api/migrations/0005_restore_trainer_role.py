# Generated manually to restore trainer role

from django.db import migrations, models

def restore_trainer_role(apps, schema_editor):
    """Restore trainer role to the system"""
    # No user data changes needed - just restoring the model structure
    pass

def reverse_restore_trainer_role(apps, schema_editor):
    """Reverse migration"""
    pass

class Migration(migrations.Migration):

    dependencies = [
        ('api', '0002_exerciseentry'),
    ]

    operations = [
        # Restore the role field with trainer option
        migrations.AlterField(
            model_name='user',
            name='role',
            field=models.CharField(
                choices=[
                    ('admin', 'Admin'),
                    ('trainer', 'Trainer'),
                    ('member', 'Member'),
                ],
                default='member',
                max_length=10
            ),
        ),
    ]
