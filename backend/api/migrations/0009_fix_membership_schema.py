# Generated manually to fix membership schema issues

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0008_add_missing_fields'),
    ]

    operations = [
        # Add missing fields to MembershipPlan
        migrations.AddField(
            model_name='membershipplan',
            name='created_at',
            field=models.DateTimeField(auto_now_add=True, null=True),
        ),
        migrations.AddField(
            model_name='membershipplan',
            name='updated_at',
            field=models.DateTimeField(auto_now=True, null=True),
        ),
        
        # Add missing fields to Membership
        migrations.AddField(
            model_name='membership',
            name='created_at',
            field=models.DateTimeField(auto_now_add=True, null=True),
        ),
        migrations.AddField(
            model_name='membership',
            name='updated_at',
            field=models.DateTimeField(auto_now=True, null=True),
        ),
        
        # Rename membership_plan to plan
        migrations.RenameField(
            model_name='membership',
            old_name='membership_plan',
            new_name='plan',
        ),
        
        # Make plan field nullable
        migrations.AlterField(
            model_name='membership',
            name='plan',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='memberships', to='api.membershipplan'),
        ),
        
        # Update status choices to match current model
        migrations.AlterField(
            model_name='membership',
            name='status',
            field=models.CharField(choices=[('pending', 'Pending'), ('approved', 'Approved'), ('rejected', 'Rejected'), ('terminated', 'Terminated')], default='pending', max_length=20),
        ),
    ]



