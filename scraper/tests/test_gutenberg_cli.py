"""Tests for Gutenberg-specific CLI option parsing."""

import pytest

from papers2zim.core.utils import CriticalError
from papers2zim.sources.gutenberg.cli import parse_options


def test_lcc_shelves_all_selects_every_shelf():
    assert parse_options({"--lcc-shelves": "all"}) == {"collections": []}


def test_lcc_shelves_accepts_supported_codes():
    assert parse_options({"--lcc-shelves": "p,pr,q,cdef"}) == {
        "collections": ["P", "PR", "Q", "CDEF"]
    }


def test_lcc_shelves_rejects_shelves_merged_into_history():
    # "C", "D", "E" and "F" are merged into "CDEF" (see transform_locc_code),
    # so they are no longer selectable on their own.
    for code in ("C", "D", "E", "F"):
        with pytest.raises(CriticalError):
            parse_options({"--lcc-shelves": code})
