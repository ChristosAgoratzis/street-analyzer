import './App.css';
import api from './api/axiosConfig';
import { useState, useEffect } from 'react';
import { FaEdit } from 'react-icons/fa';

function App() {
  const [pictures, setPictures] = useState([]);
  const [selectedPictures, setSelectedPictures] = useState([]);
  const [isSelecting, setIsSelecting] = useState(false);
  const [resultState, setResultState] = useState('default'); // default, selecting, ready
  const [resultData, setResultData] = useState(null);
  const [editMode, setEditMode] = useState(false); // Toggle between edit and result modes
  const [zoomedPicture, setZoomedPicture] = useState(null); // Picture selected for results

  const getPictures = async () => {
    try {
      const response = await api.get('/api/storedPictures');
      setPictures(response.data);
    } catch (err) {
      console.log(err);
    }
  };

  const addPictures = async (e) => {
    const files = Array.from(e.target.files);
    for (const file of files) {
      const base64 = await toBase64(file);
      const newPicture = {
        id: Date.now().toString(),
        list_number: '001',
        cars: '0',
        humans: '0',
        stop_signs: '0',
        source: base64,
      };
      try {
        await api.post('/api/storedPictures', newPicture);
        setPictures((prev) => [...prev, newPicture]);
      } catch (err) {
        console.log(err);
      }
    }
  };

  const deletePictures = async () => {
    for (const id of selectedPictures) {
      try {
        await api.delete(`/api/storedPictures`, { data: { id } });
        setPictures((prev) => prev.filter((pic) => pic.id !== id));
      } catch (err) {
        console.log(err);
      }
    }
    setSelectedPictures([]);
    setIsSelecting(false); // Exit selection mode after deletion
  };

  const toBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });

  const handleImageClick = (picture) => {
    if (resultState === 'selecting') {
      setZoomedPicture(picture);
      setResultState('ready');
    }
  };

  const deselectPicture = () => {
    setZoomedPicture(null);
    setResultState('selecting');
  };

  const toggleSelectMode = () => {
    setIsSelecting((prev) => !prev);
    if (isSelecting) setSelectedPictures([]); // Clear selection when exiting select mode
  };

  const handleGenerateResults = () => {
    if (resultState === 'ready') {
      setResultState('default');
      setResultData(zoomedPicture); // Display results for the zoomed picture
    } else if (resultState === 'default') {
      setResultState('selecting');
    }
  };

  const toggleEditMode = () => {
    setEditMode((prev) => !prev);
    setSelectedPictures([]); // Clear selections on mode toggle
    setResultState('default'); // Reset result state on toggle
    setResultData(null); // Clear result data
    setZoomedPicture(null); // Clear zoomed picture
  };

  useEffect(() => {
    getPictures();
  }, []);

  return (
    <div className="App">
      {/* Edit Button */}
      <div className="top-controls">
        <button onClick={toggleEditMode} className="edit-button">
          <FaEdit />
        </button>
      </div>

      {/* Add, Select, Delete Buttons */}
      {editMode && (
        <div className="controls">
          <input
            type="file"
            accept="image/*"
            multiple
            style={{ display: 'none' }}
            id="add-button"
            onChange={addPictures}
          />
          <button onClick={() => document.getElementById('add-button').click()}>
            Add
          </button>
          <button onClick={toggleSelectMode}>
            {isSelecting ? 'Done' : 'Select'}
          </button>
          <button onClick={deletePictures} disabled={!selectedPictures.length}>
            Delete
          </button>
        </div>
      )}

      {/* Gallery */}
      <div className="gallery">
        {pictures.map((picture) => (
          <div
            key={picture.id}
            className={`gallery-item ${
              selectedPictures.includes(picture.id) ? 'selected' : ''
            }`}
            onClick={() => handleImageClick(picture)}
          >
            <img src={picture.source} alt="gallery-item" />
          </div>
        ))}
      </div>

      {/* Generate Results Button */}
      {!editMode && (
        <div className="results">
          <button
            onClick={handleGenerateResults}
            style={{
              backgroundColor:
                resultState === 'default'
                  ? 'grey'
                  : resultState === 'selecting'
                  ? 'orange'
                  : 'green',
            }}
          >
            {resultState === 'default'
              ? 'Select One Image'
              : resultState === 'selecting'
              ? 'Generate Results'
              : 'Results Ready'}
          </button>
        </div>
      )}

      {/* Zoomed Picture */}
      {!editMode && zoomedPicture && (
        <div className="selected-picture" onClick={deselectPicture}>
          <img src={zoomedPicture.source} alt="Selected" />
        </div>
      )}

      {/* Results Grid */}
      {!editMode && resultState === 'ready' && resultData && (
        <div className="grid">
          <div>Cars: {resultData.cars}</div>
          <div>Humans: {resultData.humans}</div>
          <div>Stop Signs: {resultData.stop_signs}</div>
        </div>
      )}
    </div>
  );
}

export default App;
