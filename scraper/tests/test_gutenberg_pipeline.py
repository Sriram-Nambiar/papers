"""Tests for Gutenberg per-work processing, notably LCC shelf collapsing."""

from unittest.mock import MagicMock, patch

from papers2zim.core.models import CollectionRef, Work
from papers2zim.core.ports import WorkRef
from papers2zim.core.progress import ScraperProgress
from papers2zim.core.work_store import WorkStore
from papers2zim.sources.gutenberg.catalog import LCC_SHELF_KIND
from papers2zim.sources.gutenberg.pipeline import GutenbergPipeline


def _pipeline(work: Work, *, languages: list[str] | None) -> GutenbergPipeline:
    metadata = MagicMock()
    metadata.fetch.return_value = [work]
    return GutenbergPipeline(
        metadata=metadata,
        store=WorkStore(),
        assembler=MagicMock(),
        progress=ScraperProgress(None),
        concurrency=1,
        formats=["epub"],
        zim_name="test",
        source_slug="gutenberg",
        display_name="Project Gutenberg",
        title_search=False,
        engine=MagicMock(),
        mirror_url="https://example.org",
        languages=languages,
    )


def _work_with_shelf(shelf: str) -> Work:
    return Work(
        id="84",
        source="gutenberg",
        title="Frankenstein",
        collections=[CollectionRef(id=shelf, name=shelf, kind=LCC_SHELF_KIND)],
    )


def test_single_language_zim_collapses_literature_sub_shelf():
    work = _work_with_shelf("PR")
    pipeline = _pipeline(work, languages=["en"])

    with patch(
        "papers2zim.sources.gutenberg.pipeline.download_book", return_value=None
    ):
        pipeline.process_ref(WorkRef(id="84", source="gutenberg"))

    stored = pipeline.store.get("gutenberg", "84")
    assert stored is not None
    assert stored.collections == [CollectionRef(id="P", name="P", kind=LCC_SHELF_KIND)]


def test_multi_language_zim_keeps_literature_sub_shelf():
    work = _work_with_shelf("PR")
    pipeline = _pipeline(work, languages=["en", "fr"])

    with patch(
        "papers2zim.sources.gutenberg.pipeline.download_book", return_value=None
    ):
        pipeline.process_ref(WorkRef(id="84", source="gutenberg"))

    stored = pipeline.store.get("gutenberg", "84")
    assert stored is not None
    assert stored.collections == [
        CollectionRef(id="PR", name="PR", kind=LCC_SHELF_KIND)
    ]


def test_single_language_zim_leaves_non_literature_shelf_untouched():
    work = _work_with_shelf("CDEF")
    pipeline = _pipeline(work, languages=["en"])

    with patch(
        "papers2zim.sources.gutenberg.pipeline.download_book", return_value=None
    ):
        pipeline.process_ref(WorkRef(id="84", source="gutenberg"))

    stored = pipeline.store.get("gutenberg", "84")
    assert stored is not None
    assert stored.collections == [
        CollectionRef(id="CDEF", name="CDEF", kind=LCC_SHELF_KIND)
    ]
