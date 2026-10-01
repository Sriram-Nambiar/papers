"""Tests for the ignore-key derivation in validate_i18n."""

from papers2zim.scripts.validate_i18n import get_ignored_keys


def _en_data(**overrides):
    data = {"about": {}}
    data.update(overrides)
    return data


def test_ignores_locale_metadata_fields():
    assert {"language", "isocode"} <= get_ignored_keys(_en_data())


def test_ignores_collection_ids_found_in_data():
    ignored = get_ignored_keys({"collections": {"a": {}, "18": {}}})
    assert {"collections.a", "collections.18"} <= ignored


def test_ignores_intro_and_mission_paragraph_keys():
    data = _en_data(
        about={
            "introHeading": "Introduction",
            "introParagraph1": "One",
            "introParagraph2": "Two",
            "missionHeading": "Mission",
            "missionParagraph1": "One",
        }
    )
    ignored = get_ignored_keys(data)
    assert {
        "about.introParagraph1",
        "about.introParagraph2",
        "about.missionParagraph1",
    } <= ignored


def test_ignores_arbitrarily_high_paragraph_numbers():
    data = _en_data(
        about={
            "introParagraph1": "One",
            "missionParagraph23": "Twenty-three",
            "missionParagraph999": "Nine ninety-nine",
        }
    )
    ignored = get_ignored_keys(data)
    assert "about.missionParagraph23" in ignored
    assert "about.missionParagraph999" in ignored


def test_does_not_ignore_other_about_keys():
    data = _en_data(
        about={
            "attribution": "Attribution",
            "introHeading": "Introduction",
            "missionAuthor": "Author",
            "missionHeading": "Mission",
        }
    )
    ignored = get_ignored_keys(data)
    assert not any(key.startswith("about.") for key in ignored)


def test_ignores_no_paragraph_keys_without_an_about_section():
    assert not any(key.startswith("about.") for key in get_ignored_keys({}))


def test_tolerates_non_dict_about_section():
    ignored = get_ignored_keys({"about": ["not", "a", "mapping"]})
    assert not any(key.startswith("about.") for key in ignored)


def test_does_not_match_partial_paragraph_names():
    data = _en_data(
        about={
            "introParagraph1a": "Trailing letter",
            "missionParagraphX": "Wrong suffix",
            "paragraph1": "No section prefix",
        }
    )
    ignored = get_ignored_keys(data)
    assert not any(key.startswith("about.") for key in ignored)
