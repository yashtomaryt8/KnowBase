import re
from pathlib import Path

from django.core.management.base import BaseCommand, CommandError
from django.db import transaction

from apps.pages.models import Page
from apps.search.services import embed_page
from apps.topics.models import Topic


ICON_MAP = {
    'react': '⚛️',
    'django': '🎸',
    'aiml': '🤖',
    'ai': '🤖',
    'machine learning': '🤖',
    'api': '🧪',
    'testing': '🧪',
    'cloud': '☁️',
    'devops': '⚙️',
    'git': '🌿',
    'system design': '🏗️',
}


class Command(BaseCommand):
    help = 'Seed topics and pages from a directory of markdown files.'

    def add_arguments(self, parser):
        parser.add_argument('directory', type=str)
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Delete all existing topics before seeding.',
        )

    @transaction.atomic
    def handle(self, *args, **options):
        directory = Path(options['directory']).expanduser()
        if not directory.exists() or not directory.is_dir():
            raise CommandError(f'Directory not found: {directory}')

        markdown_files = sorted(directory.glob('*.md'))
        if not markdown_files:
            self.stdout.write(self.style.WARNING(f'No markdown files found in {directory}'))
            return

        if options['clear']:
            deleted_count, _ = Topic.objects.all().delete()
            self.stdout.write(self.style.WARNING(f'Cleared existing topics: {deleted_count} rows'))

        for file_index, markdown_file in enumerate(markdown_files):
            self._seed_file(markdown_file, file_index)

    def _seed_file(self, markdown_file: Path, file_index: int):
        raw_lines = markdown_file.read_text(encoding='utf-8').splitlines()
        root_name = self._extract_root_name(raw_lines, markdown_file.stem)
        root_topic = Topic.objects.create(
            name=root_name,
            icon=self._detect_icon(root_name),
            sort_order=file_index,
        )
        self.stdout.write(self.style.SUCCESS(f'Created topic: {root_topic.name}'))

        current_section = None
        current_subtopic_order = 0
        current_page_order = 0

        for line in raw_lines:
            stripped = line.strip()
            if not stripped or stripped == '---':
                continue

            if line.startswith('# '):
                continue

            if line.startswith('## '):
                section_name = self._clean_heading(line[3:])
                current_section = Topic.objects.create(
                    name=section_name,
                    icon=self._detect_icon(section_name),
                    parent=root_topic,
                    sort_order=current_subtopic_order,
                )
                current_subtopic_order += 1
                current_page_order = 0
                self.stdout.write(self.style.SUCCESS(f'Created topic: {current_section.name}'))
                continue

            if line.startswith('  - '):
                if current_section is None:
                    continue

                nested_name = self._clean_bullet(line)
                nested_topic = Topic.objects.create(
                    name=nested_name,
                    icon=self._detect_icon(nested_name),
                    parent=current_section,
                    sort_order=current_page_order,
                )
                current_page_order += 1
                self.stdout.write(self.style.SUCCESS(f'Created topic: {nested_topic.name}'))
                continue

            if line.startswith('- '):
                if current_section is None:
                    continue

                page_title = self._clean_bullet(line)
                page = Page.objects.create(
                    topic=current_section,
                    title=page_title,
                    content_json=self._basic_tiptap_doc(page_title),
                    content_text=page_title,
                    word_count=len(page_title.split()),
                    sort_order=current_page_order,
                )
                current_page_order += 1
                self.stdout.write(self.style.SUCCESS(f'Created page: {page.title}'))
                chunk_count = embed_page(page)
                self.stdout.write(f'Indexed page: {page.title} ({chunk_count} chunks)')

    def _extract_root_name(self, lines: list[str], fallback: str) -> str:
        for line in lines:
            if line.startswith('# '):
                return self._clean_heading(line[2:])
        return self._clean_heading(fallback)

    def _clean_heading(self, value: str) -> str:
        cleaned = value.strip()
        cleaned = re.sub(r'^\d+[\.\)\-:\s]+', '', cleaned)
        return cleaned or 'Untitled'

    def _clean_bullet(self, line: str) -> str:
        return re.sub(r'^\s*-\s+', '', line).strip()

    def _detect_icon(self, name: str) -> str:
        lower_name = name.lower()
        for keyword, icon in ICON_MAP.items():
            if keyword in lower_name:
                return icon
        return '📁'

    def _basic_tiptap_doc(self, text: str) -> dict:
        return {
            'type': 'doc',
            'content': [
                {
                    'type': 'paragraph',
                    'content': [
                        {
                            'type': 'text',
                            'text': text,
                        }
                    ],
                }
            ],
        }
