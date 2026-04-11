from rest_framework.test import APITestCase

from .models import Topic


class TopicReorderViewTests(APITestCase):
    def test_patch_reorders_root_topics(self):
        first = Topic.objects.create(name='React', sort_order=0)
        second = Topic.objects.create(name='Django', sort_order=1)

        response = self.client.patch(
            '/api/topics/root/reorder/',
            {
                'children': [
                    {'id': str(second.id), 'sort_order': 0},
                    {'id': str(first.id), 'sort_order': 1},
                ]
            },
            format='json',
        )

        self.assertEqual(response.status_code, 200)

        first.refresh_from_db()
        second.refresh_from_db()

        self.assertEqual(second.sort_order, 0)
        self.assertEqual(first.sort_order, 1)

    def test_patch_rejects_topics_outside_parent_scope(self):
        parent = Topic.objects.create(name='Frontend')
        child = Topic.objects.create(name='React Query', parent=parent, sort_order=0)
        outsider = Topic.objects.create(name='PostgreSQL', sort_order=0)

        response = self.client.patch(
            f'/api/topics/{parent.id}/reorder/',
            {
                'children': [
                    {'id': str(child.id), 'sort_order': 0},
                    {'id': str(outsider.id), 'sort_order': 1},
                ]
            },
            format='json',
        )

        self.assertEqual(response.status_code, 400)
        self.assertEqual(
            response.data['detail'],
            'One or more topics were not found under the requested parent.',
        )
