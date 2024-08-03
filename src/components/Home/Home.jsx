import React, { useEffect, useState, useRef } from "react";
import './home.css';
import logo from "../../assets/spotify-logo.png";

const Home = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSong, setSelectedSong] = useState(null);
  const [currentSongIndex, setCurrentSongIndex] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [progress, setProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showMenu, setShowMenu] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const audioRef = useRef(null);
  const [backgroundColor, setBackgroundColor] = useState('#071952');

  function onShowSong(songId) {
    const songIndex = data.findIndex(song => song.id === songId);
    const song = data[songIndex];
    setSelectedSong(song);
    setCurrentSongIndex(songIndex);

    setBackgroundColor(song.accent || '#fff');
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("https://cms.samespace.com/items/songs");
        const result = await response.json();

        if (response.ok) {
          const resultData = result.data;
          const updatedData = resultData.map(eachItem => ({
            accent: eachItem.accent,
            artist: eachItem.artist,
            cover: eachItem.cover,
            dateCreated: new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date(eachItem.date_created)),
            id: eachItem.id,
            name: eachItem.name,
            sort: eachItem.sort,
            status: eachItem.status,
            topTrack: eachItem.top_track,
            url: eachItem.url,
            userCreated: eachItem.user_created,
            userUpdated: eachItem.user_updated,
            thumbnail: `https://cms.samespace.com/assets/${eachItem.cover}`
          }));
          setData(updatedData);
        } else {
          throw new Error('Failed to fetch data');
        }
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (selectedSong && audioRef.current) {
      audioRef.current.play();
      setIsPlaying(true);
    }
  }, [selectedSong]);

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleNextSong = () => {
    if (currentSongIndex !== null) {
      const nextIndex = (currentSongIndex + 1) % data.length;
      setSelectedSong(data[nextIndex]);
      setCurrentSongIndex(nextIndex);
    }
  };

  const handlePreviousSong = () => {
    if (currentSongIndex !== null) {
      const prevIndex = (currentSongIndex - 1 + data.length) % data.length;
      setSelectedSong(data[prevIndex]);
      setCurrentSongIndex(prevIndex);
    }
  };

 

  const handleMuteUnmute = () => {
    if (audioRef.current) {
      const newVolume = isMuted ? 1 : 0;
      setVolume(newVolume);
      setIsMuted(!isMuted);
      audioRef.current.volume = newVolume;
    }
  };

  const handleProgressChange = (e) => {
    const newProgress = e.target.value;
    if (audioRef.current) {
      const newTime = (newProgress / 100) * audioRef.current.duration;
      audioRef.current.currentTime = newTime;
      setProgress(newProgress);
    }
  };

  const handleAudioTimeUpdate = () => {
    if (audioRef.current) {
      setProgress((audioRef.current.currentTime / audioRef.current.duration) * 100);
    }
  };



  const filteredSongs = data.filter(song =>
    song.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    song.artist.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="container-fluid" id="ChangeBgColor" style={{ backgroundColor }}>
      <div className="row">
        <div className="col-12 col-lg-2 start-card" style={{ height: '100vh' }}>
          <img src={logo} alt="logo image" className="logo" />
          <div className="avatar">
            {/* Avatar content */}
          </div>
        </div>

        <div className="col-12 col-lg-4 p-0">
          <div className="top-track-section">
            <h2 className="top-track-tit1">For You</h2>
            <h2 className="top-track-tit2">Top Tracks</h2>
          </div>
            <input
              type="search"
              placeholder="Search by song or artist"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-inp"
            />
          {filteredSongs.length > 0 && (
            <div>
              {filteredSongs.map(song => (
                <div key={song.id} className="songs-card">
                  <div className="songs-card1" onClick={() => onShowSong(song.id)}>
                    <div className="inside-card">
                      <img src={song.thumbnail} alt={song.name} className="song-image" />
                      <div className="songs-desc">
                        <span className="songs-des1">{song.artist}</span>
                        <span className="songs-des2">{song.name}</span>
                      </div>
                    </div>
                    <span className="songs-des-time">{song.dateCreated}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="col-12 col-lg-6 active-song-main">
          <div className="active-song-card">
            <div className="active-card1">
              <span className="card-tit1">{selectedSong ? selectedSong.name : 'Select a song'}</span>
              <span className="card-tit2">{selectedSong ? selectedSong.artist : ''}</span>
            </div>
            <div className="active-card2">
              {selectedSong && <img src={selectedSong.thumbnail} alt={selectedSong.name} className="active-image" />}
            </div>
            <div className="audio-player-card">
              {selectedSong && (
                <div className="audio-player">
                  <audio
                    ref={audioRef}
                    src={selectedSong.url}
                    onTimeUpdate={handleAudioTimeUpdate}
                    preload="metadata"
                  >
                    Your browser does not support the audio element.
                  </audio>
                  <div className="audio-controls">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={progress}
                      onChange={handleProgressChange}
                      className="progress-bar"
                    />
                    <div className="songs-btn-section">
                      <button className="aud-btns" onClick={() => setShowMenu(!showMenu)}>
                        ⋯
                      </button>
                      <div className="songs-play-card">
                        <button className="control-btns" onClick={handlePreviousSong}>◄◄</button>
                        <button className="control-btns" onClick={handlePlayPause}>
                          {isPlaying ? '🔊' : '🔇'}
                        </button>
                        <button className="control-btns" onClick={handleNextSong}>►►</button>
                      </div>
                      <button className="aud-btns" onClick={handleMuteUnmute}>
                        {isMuted ? '🔇' : '🔊'}
                      </button>
                    </div>
                    {/* {showMenu && (
                      <div className="menu">
                        <button onClick={() => handlePlaybackRateChange(0.5)}>0.5x</button>
                        <button onClick={() => handlePlaybackRateChange(1)}>1x</button>
                        <button onClick={() => handlePlaybackRateChange(1.5)}>1.5x</button>
                        <button onClick={() => handlePlaybackRateChange(2)}>2x</button>
                        <button onClick={handleDownload}>Download</button>
                      </div>
                    )} */}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;