from utils.calculations import process_analysis_data

def test_process_analysis_data():
    """Test du traitement des données"""
    data = {
        "length": {"value": 10},
        "width": {"value": 5},
        "height": {"value": 2},
        "surface": {"value": 0},
        "volume": {"value": 0}
    }
    
    result = process_analysis_data(data)

    assert isinstance(result["surface"], dict)
    assert result["surface"]["value"] == 50  # 10 * 5
    assert result["surface"]["unit"]["label"] == "m2"

    assert isinstance(result["volume"], dict)
    assert result["volume"]["value"] == 100  # 10 * 5 * 2
    assert result["volume"]["unit"]["label"] == "m3"