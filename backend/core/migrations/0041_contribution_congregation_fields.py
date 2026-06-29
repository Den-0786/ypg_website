from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0040_remove_websitesettings_social_media_facebook_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='contribution',
            name='purpose',
            field=models.CharField(blank=True, max_length=300, null=True),
        ),
        migrations.AddField(
            model_name='contribution',
            name='amount_to_pay',
            field=models.DecimalField(blank=True, decimal_places=2, max_digits=10, null=True),
        ),
        migrations.AddField(
            model_name='contribution',
            name='amount_paid',
            field=models.DecimalField(blank=True, decimal_places=2, default=0, max_digits=10, null=True),
        ),
        migrations.AlterField(
            model_name='contribution',
            name='type',
            field=models.CharField(
                choices=[
                    ('renewal', 'Renewal'),
                    ('offertory', 'Offertory'),
                    ('congregation_contribution', 'Congregation Contribution'),
                ],
                max_length=30,
            ),
        ),
        migrations.AlterField(
            model_name='contribution',
            name='amount',
            field=models.DecimalField(blank=True, decimal_places=2, max_digits=10, null=True),
        ),
    ]
