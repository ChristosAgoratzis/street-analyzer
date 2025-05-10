import './App.css';
import api from './api/axiosConfig';
import { useState, useEffect } from 'react';
import { FaEdit } from 'react-icons/fa'; // For Edit Icon

function App() {
  const [pictures, setPictures] = useState([]);
  const [selectedPictures, setSelectedPictures] = useState([]);
  const [isSelecting, setIsSelecting] = useState(false);
  const [modalImage, setModalImage] = useState(null);
  const [resultState, setResultState] = useState('default'); // default, selecting, ready
  const [resultData, setResultData] = useState(null);
  const [editMode, setEditMode] = useState(false); // Toggle between edit and result modes

  // Fetch pictures from the server
  const getPictures = async () => {
    try {
      const response = await api.get('/api/storedPictures');
      setPictures(response.data);
    } catch (err) {
      console.log(err);
    }
  };

  // Add pictures
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

  // Delete selected pictures
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

  // Convert file to Base64
  const toBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });


  // Toggle selection mode
  const toggleSelectMode = () => {
    setIsSelecting((prev) => !prev);
    if (isSelecting) setSelectedPictures([]); // Clear selection when exiting select mode
  };


  const handleImageClick = async (picture) => {
    if (isSelecting) {
      // Toggle selection in edit mode
      setSelectedPictures((prev) =>
        prev.includes(picture.id)
          ? prev.filter((id) => id !== picture.id)
          : [...prev, picture.id]
      );
    } else if (resultState === "selecting") {
      // Call FastAPI to process the selected image
      try {
        const response = await fetch("http://localhost:8001/process-picture/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: picture.id,
            source: picture.source, // Include the base64 image
          }),
        });
  
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`Error: ${errorData.detail}`);
        }
  
        const data = await response.json();
        console.log("got data");
  
        // Prepare the updated picture with new attributes
        const updatedPicture = {
          ...picture,
          cars: data.cars,
          humans: data.humans,
          stop_signs: data.stop_signs,
          list_number: "2", // Change list_number to '2'
        };
       
        // Update the picture in the Spring Boot backend
        await api.put(`/api/storedPictures/${picture.id}`, updatedPicture);

        console.log("updated picture db ");
  
        // Update the picture in the React state
        setPictures((prev) =>
          prev.map((pic) =>
            pic.id === updatedPicture.id ? updatedPicture : pic
          )
        );

        console.log("updated picture react ")
  
        // Update state for "Results Ready"
        setResultData(updatedPicture);
        setResultState("ready");
      } catch (err) {
        console.error("Error processing picture or updating database:", err);
        alert("Failed to process the picture.");
      }
    } else {
      // Show full-size image in modal
      setModalImage(picture.source);
    }
  };
  
  

  const handleGenerateResults = () => {
    if (resultState === "ready") {
      // Reset to allow new selections
      setResultState("default");
      setResultData(null);
    } else if (resultState === "selecting") {
      // Cancel selection mode
      setResultState("default");
    } else {
      // Start selection process
      setResultState("selecting");
    }
  };
  
  
  

  // Toggle edit mode
  const toggleEditMode = () => {
    setEditMode((prev) => !prev);
    setSelectedPictures([]); // Clear selections on mode toggle
    setResultState('default'); // Reset result state on toggle
    setResultData(null); // Clear result data
  };

  useEffect(() => {
    getPictures();
  }, []);

  return (
    <div className="App">
      <div className="top-controls">
        <button onClick={toggleEditMode} className="edit-button">
          <FaEdit />
        </button>
      </div>

      {editMode ? (
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
      ) : (
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
              ? 'Generate Results'
              : resultState === 'selecting'
              ? 'Select Picture'
              : 'Results Ready'}
          </button>
          {resultState === 'ready' && resultData && (
            <div>
              <div className="selected-picture">
                <img src={resultData.source} alt="Selected" />
              </div>
              <div className="grid">
                <div>Cars: {resultData.cars}</div>
                <div>Humans: {resultData.humans}</div>
                <div>Stop Signs: {resultData.stop_signs}</div>
              </div>
            </div>
          )}
        </div>
      )}

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

      {modalImage && (
        <div className="modal" onClick={() => setModalImage(null)}>
          <img src={modalImage} alt="Full view" />
        </div>
      )}
    </div>
  );
}

export default App;
