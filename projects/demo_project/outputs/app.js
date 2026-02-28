
// projects/demo_project/outputs/app.js

import React, { useState, useEffect, createContext, useContext } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

// --- Mock Data and API Simulation ---
const mockAlbums = [
  {
    id: 'album-1',
    title: '첫 번째 생일',
    description: '사랑하는 우리 아기의 첫 생일 파티 사진들입니다.',
    date: '2023-10-20',
    location: { name: '우리집', lat: 37.5665, lon: 126.9780 },
    weather: '맑음, 20°C',
    photos: [
      { id: 'photo-1-1', uri: '/images/baby1.jpg', caption: '촛불 끄기 전' },
      { id: 'photo-1-2', uri: '/images/baby2.jpg', caption: '케이크 먹는 중' },
      { id: 'photo-1-3', uri: '/images/baby3.jpg', caption: '선물 개봉!' },
    ],
  },
  {
    id: 'album-2',
    title: '가을 소풍',
    description: '단풍 구경 갔던 날의 즐거운 추억!',
    date: '2023-10-10',
    location: { name: '서울숲', lat: 37.5445, lon: 127.0396 },
    weather: '흐림, 15°C',
    photos: [
      { id: 'photo-2-1', uri: '/images/park1.jpg', caption: '낙엽 밟기' },
      { id: 'photo-2-2', uri: '/images/park2.jpg', caption: '그네 타기' },
    ],
  },
];

let nextAlbumId = mockAlbums.length + 1;
let nextPhotoId = 100;

const MockAPI = {
  getAlbums: async () => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockAlbums), 300);
    });
  },
  getAlbumById: async (id) => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockAlbums.find((album) => album.id === id)), 300);
    });
  },
  createAlbum: async (albumData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newAlbum = {
          ...albumData,
          id: `album-${nextAlbumId++}`,
          photos: albumData.photos.map(photo => ({ ...photo, id: `photo-${nextPhotoId++}` })),
        };
        mockAlbums.unshift(newAlbum); // Add to the beginning for latest first
        resolve(newAlbum);
      }, 300);
    });
  },
  updateAlbum: async (id, updatedData) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = mockAlbums.findIndex((album) => album.id === id);
        if (index > -1) {
          mockAlbums[index] = { ...mockAlbums[index], ...updatedData };
          resolve(mockAlbums[index]);
        } else {
          reject(new Error('Album not found'));
        }
      }, 300);
    });
  },
  uploadImage: async (imageFile) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simulate image upload and return a URI
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve({ uri: reader.result, name: imageFile.name });
        };
        reader.readAsDataURL(imageFile);
      }, 200);
    });
  },
  getWeather: async (date, lat, lon) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Basic mock weather response
        const weatherConditions = ['맑음', '흐림', '비', '눈'];
        const randomWeather = weatherConditions[Math.floor(Math.random() * weatherConditions.length)];
        const temperature = (Math.random() * 20 + 5).toFixed(0); // 5 to 25 degrees
        resolve({ weather: `${randomWeather}, ${temperature}°C` });
      }, 500);
    });
  },
  generatePdf: async (albumIds) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const selectedAlbums = mockAlbums.filter(album => albumIds.includes(album.id));
        console.log('Generating PDF for albums:', selectedAlbums);
        // In a real app, this would generate a PDF and return a URL
        resolve({ pdfUrl: '/mock-photobook.pdf' });
      }, 1000);
    });
  },
};

// --- Context for global state (simple for demonstration) ---
const AppContext = createContext();

export function AppProvider({ children }) {
  const [albums, setAlbums] = useState([]);

  useEffect(() => {
    const fetchAlbums = async () => {
      const fetchedAlbums = await MockAPI.getAlbums();
      setAlbums(fetchedAlbums.sort((a, b) => new Date(b.date) - new Date(a.date)));
    };
    fetchAlbums();
  }, []);

  const addAlbum = async (albumData) => {
    const newAlbum = await MockAPI.createAlbum(albumData);
    setAlbums(prev => [newAlbum, ...prev].sort((a, b) => new Date(b.date) - new Date(a.date)));
    return newAlbum;
  };

  const updateAlbum = async (id, updatedData) => {
    const updated = await MockAPI.updateAlbum(id, updatedData);
    setAlbums(prev => prev.map(album => album.id === id ? updated : album));
    return updated;
  };

  return (
    <AppContext.Provider value={{ albums, addAlbum, updateAlbum }}>
      {children}
    </AppContext.Provider>
  );
}

export const useAppContext = () => useContext(AppContext);

// --- Components ---

const Header = ({ title, showBack = false }) => {
  const router = useRouter();
  return (
    <header className="header bg-primary text-white p-4 flex justify-between items-center">
      {showBack && (
        <button onClick={() => router.back()} className="text-white mr-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}
      <h1 className="text-2xl font-bold flex-grow">{title}</h1>
      {/* Optional: Add user avatar or settings icon */}
    </header>
  );
};

const AlbumCard = ({ album }) => {
  const router = useRouter();
  const firstPhotoUri = album.photos.length > 0 ? album.photos[0].uri : 'https://via.placeholder.com/150';

  return (
    <div
      className="album bg-white shadow-md rounded-lg p-4 mb-4 cursor-pointer"
      onClick={() => router.push(`/album/${album.id}`)}
    >
      <div className="flex items-center mb-2">
        <img src={firstPhotoUri} alt={album.title} className="w-16 h-16 object-cover rounded mr-4" />
        <div>
          <h3 className="album-title text-xl font-semibold">{album.title}</h3>
          <p className="album-description text-gray-600 text-sm">{album.description}</p>
        </div>
      </div>
      <p className="text-gray-500 text-xs">{album.date} - {album.location.name}</p>
    </div>
  );
};

const PhotoGrid = ({ photos, onPhotoClick }) => {
  return (
    <div className="photo-grid grid grid-cols-2 gap-2 mt-4">
      {photos.map((photo) => (
        <div key={photo.id} className="photo-item rounded shadow overflow-hidden cursor-pointer" onClick={() => onPhotoClick(photo)}>
          <img src={photo.uri} alt={photo.caption} className="w-full h-32 object-cover" />
        </div>
      ))}
    </div>
  );
};

const FullscreenPhotoView = ({ photo, onClose, onCaptionChange, isEditing }) => {
  const [currentCaption, setCurrentCaption] = useState(photo.caption);

  useEffect(() => {
    setCurrentCaption(photo.caption);
  }, [photo]);

  const handleCaptionSave = () => {
    onCaptionChange(photo.id, currentCaption);
  };

  return (
    <div className="fullscreen-photo fixed left-0 top-0 w-full h-full bg-black flex items-center justify-center z-50">
      <button onClick={onClose} className="absolute top-4 right-4 text-white text-3xl z-50">×</button>
      <img src={photo.uri} alt={photo.caption} className="max-w-full max-h-full object-contain" />
      <div className="overlay-caption absolute bottom-0 bg-black bg-opacity-75 text-white text-sm p-2 w-full text-center">
        {isEditing ? (
          <div className="flex flex-col items-center">
            <input
              type="text"
              value={currentCaption}
              onChange={(e) => setCurrentCaption(e.target.value)}
              className="input-field border-gray-300 rounded p-1 w-full max-w-sm text-black"
            />
            <button onClick={handleCaptionSave} className="bg-primary text-white text-xs px-2 py-1 rounded mt-1">저장</button>
          </div>
        ) : (
          <p>{photo.caption || '캡션 없음'}</p>
        )}
      </div>
    </div>
  );
};

// --- Pages ---

// pages/index.js
const HomePage = () => {
  const { albums } = useAppContext();
  const router = useRouter();
  const [showPdfExportModal, setShowPdfExportModal] = useState(false);
  const [selectedAlbumsForPdf, setSelectedAlbumsForPdf] = useState([]);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfLink, setPdfLink] = useState('');

  const groupedAlbums = albums.reduce((acc, album) => {
    const monthYear = new Date(album.date).toLocaleString('ko-KR', { year: 'numeric', month: 'long' });
    if (!acc[monthYear]) {
      acc[monthYear] = [];
    }
    acc[monthYear].push(album);
    return acc;
  }, {});

  const handlePdfExportClick = () => {
    setShowPdfExportModal(true);
    setSelectedAlbumsForPdf([]); // Reset selection
    setPdfLink('');
  };

  const handleAlbumSelectForPdf = (albumId) => {
    setSelectedAlbumsForPdf(prev =>
      prev.includes(albumId) ? prev.filter(id => id !== albumId) : [...prev, albumId]
    );
  };

  const handleGeneratePdf = async () => {
    if (selectedAlbumsForPdf.length === 0) {
      alert('PDF로 내보낼 앨범을 선택해주세요.');
      return;
    }
    setPdfLoading(true);
    try {
      const response = await MockAPI.generatePdf(selectedAlbumsForPdf);
      setPdfLink(response.pdfUrl);
    } catch (error) {
      console.error('PDF 생성 실패:', error);
      alert('PDF 생성에 실패했습니다.');
    } finally {
      setPdfLoading(false);
    }
  };

  return (
    <div className="body">
      <Head>
        <title>아이 포토북</title>
      </Head>
      <Header title="아이 포토북" />
      <div className="container">
        <div className="flex justify-between items-center mb-4">
          <button
            className="pdf-export bg-secondary text-white font-bold py-2 px-4 rounded"
            onClick={handlePdfExportClick}
          >
            PDF 내보내기
          </button>
          <button
            className="bg-primary text-white font-bold py-2 px-4 rounded"
            onClick={() => router.push('/create-album')}
          >
            새 앨범 생성
          </button>
        </div>

        {Object.keys(groupedAlbums).sort((a, b) => new Date(b) - new Date(a)).map((monthYear) => (
          <div key={monthYear} className="date-list">
            <h2 className="date-section text-primary font-bold mt-8 mb-4">{monthYear}</h2>
            {groupedAlbums[monthYear].map((album) => (
              <AlbumCard key={album.id} album={album} />
            ))}
          </div>
        ))}
      </div>

      {showPdfExportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">PDF로 내보낼 앨범 선택</h2>
            {albums.map((album) => (
              <div key={album.id} className="flex items-center mb-2">
                <input
                  type="checkbox"
                  id={`pdf-album-${album.id}`}
                  checked={selectedAlbumsForPdf.includes(album.id)}
                  onChange={() => handleAlbumSelectForPdf(album.id)}
                  className="mr-2"
                />
                <label htmlFor={`pdf-album-${album.id}`}>{album.title} ({album.date})</label>
              </div>
            ))}
            <div className="flex justify-end mt-4">
              <button
                className="bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded mr-2"
                onClick={() => setShowPdfExportModal(false)}
              >
                취소
              </button>
              <button
                className="pdf-export bg-secondary text-white font-bold py-2 px-4 rounded"
                onClick={handleGeneratePdf}
                disabled={pdfLoading}
              >
                {pdfLoading ? 'PDF 생성 중...' : 'PDF 생성'}
              </button>
            </div>
            {pdfLink && (
              <div className="mt-4 text-center">
                <p className="text-green-600 mb-2">PDF가 성공적으로 생성되었습니다!</p>
                <a href={pdfLink} target="_blank" rel="noopener noreferrer" className="text-primary underline">PDF 다운로드</a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// pages/create-album.js
const CreateAlbumPage = () => {
  const router = useRouter();
  const { addAlbum } = useAppContext();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [locationName, setLocationName] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [weather, setWeather] = useState('');
  const [selectedImageFiles, setSelectedImageFiles] = useState([]); // File objects
  const [previewImages, setPreviewImages] = useState([]); // Base64 or Object URLs for display
  const [isSaving, setIsSaving] = useState(false);
  const [isFetchingWeather, setIsFetchingWeather] = useState(false);

  useEffect(() => {
    // Simulate initial weather fetch if location/date is set
    if (date && latitude && longitude && !weather) {
      handleFetchWeather();
    }
  }, [date, latitude, longitude]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleImageChange = async (event) => {
    const files = Array.from(event.target.files);
    setSelectedImageFiles(files);

    const previews = await Promise.all(files.map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });
    }));
    setPreviewImages(previews);
  };

  const handleFetchWeather = async () => {
    if (!date || !latitude || !longitude) {
      alert('날짜와 위치(위도, 경도)를 입력해야 날씨를 조회할 수 있습니다.');
      return;
    }
    setIsFetchingWeather(true);
    try {
      const weatherData = await MockAPI.getWeather(date, parseFloat(latitude), parseFloat(longitude));
      setWeather(weatherData.weather);
    } catch (error) {
      console.error('날씨 정보 가져오기 실패:', error);
      alert('날씨 정보를 가져오는 데 실패했습니다.');
    } finally {
      setIsFetchingWeather(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !date || selectedImageFiles.length === 0) {
      alert('앨범 제목, 날짜, 최소 한 장의 사진은 필수입니다.');
      return;
    }

    setIsSaving(true);
    try {
      const uploadedPhotos = await Promise.all(selectedImageFiles.map(file => MockAPI.uploadImage(file)));
      const photosWithCaptions = uploadedPhotos.map(photo => ({
        ...photo,
        caption: '', // Default empty caption
      }));

      const newAlbum = {
        title,
        description,
        date,
        location: {
          name: locationName,
          lat: parseFloat(latitude) || null,
          lon: parseFloat(longitude) || null,
        },
        weather,
        photos: photosWithCaptions,
      };

      await addAlbum(newAlbum);
      router.push('/');
    } catch (error) {
      console.error('앨범 생성 실패:', error);
      alert('앨범 생성 중 오류가 발생했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="body">
      <Head>
        <title>새 앨범 생성</title>
      </Head>
      <Header title="새 앨범 생성" showBack={true} />
      <div className="container">
        <form onSubmit={handleSubmit} className="detail flex flex-col gap-4 bg-white p-6 rounded-lg shadow-md mt-4">
          <div className="detail-section">
            <label className="detail-title block mb-1">앨범 제목</label>
            <input
              type="text"
              className="input-field border-gray-300"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="detail-section">
            <label className="detail-title block mb-1">앨범 설명</label>
            <textarea
              className="input-field border-gray-300 h-24"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            ></textarea>
          </div>

          <div className="detail-section">
            <label className="detail-title block mb-1">날짜</label>
            <input
              type="date"
              className="input-field border-gray-300"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <div className="detail-section">
            <label className="detail-title block mb-1">위치 (GPS 자동 감지 / 수동 입력)</label>
            <input
              type="text"
              placeholder="위치 이름 (예: 우리집, 서울숲)"
              className="input-field border-gray-300 mb-2"
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
            />
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="위도 (Latitude)"
                className="input-field border-gray-300 w-1/2"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                step="0.0001"
              />
              <input
                type="number"
                placeholder="경도 (Longitude)"
                className="input-field border-gray-300 w-1/2"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                step="0.0001"
              />
            </div>
            <button
              type="button"
              onClick={handleFetchWeather}
              disabled={isFetchingWeather || !date || !latitude || !longitude}
              className="bg-blue-500 text-white py-2 px-4 rounded mt-2 text-sm"
            >
              {isFetchingWeather ? '날씨 불러오는 중...' : '날씨 가져오기'}
            </button>
            {weather && <p className="text-gray-700 mt-2">날씨: {weather}</p>}
          </div>

          <div className="detail-section">
            <label className="detail-title block mb-1">사진 선택 (다중 선택 가능)</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              className="input-field border-gray-300 p-1"
              required
            />
            <div className="photo-grid mt-2">
              {previewImages.map((src, index) => (
                <img key={index} src={src} alt={`미리보기 ${index + 1}`} className="w-full h-24 object-cover rounded" />
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="pdf-export bg-primary text-white font-bold py-2 px-4 rounded mt-4"
            disabled={isSaving}
          >
            {isSaving ? '앨범 저장 중...' : '앨범 생성'}
          </button>
        </form>
      </div>
    </div>
  );
};

// pages/album/[id].js
const AlbumDetailPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const { albums, updateAlbum } = useAppContext();
  const [album, setAlbum] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fullscreenPhoto, setFullscreenPhoto] = useState(null);
  const [isEditingCaption, setIsEditingCaption] = useState(false);

  useEffect(() => {
    if (id) {
      setLoading(true);
      const foundAlbum = albums.find(a => a.id === id);
      if (foundAlbum) {
        setAlbum(foundAlbum);
      } else {
        // Handle album not found, maybe redirect
        console.warn('Album not found:', id);
        router.push('/');
      }
      setLoading(false);
    }
  }, [id, albums, router]);

  const handlePhotoClick = (photo) => {
    setFullscreenPhoto(photo);
    setIsEditingCaption(false); // Reset caption editing state
  };

  const handleCloseFullscreen = () => {
    setFullscreenPhoto(null);
  };

  const handleCaptionChange = async (photoId, newCaption) => {
    if (!album) return;
    const updatedPhotos = album.photos.map(p =>
      p.id === photoId ? { ...p, caption: newCaption } : p
    );
    const updatedAlbum = { ...album, photos: updatedPhotos };
    await updateAlbum(album.id, { photos: updatedPhotos });
    setAlbum(updatedAlbum); // Update local state immediately
    setIsEditingCaption(false); // Exit edit mode after saving
  };

  const toggleEditCaption = () => {
    setIsEditingCaption(!isEditingCaption);
  };

  if (loading) {
    return <div className="body container text-center py-8">로딩 중...</div>;
  }

  if (!album) {
    return <div className="body container text-center py-8">앨범을 찾을 수 없습니다.</div>;
  }

  return (
    <div className="body">
      <Head>
        <title>{album.title}</title>
      </Head>
      <Header title={album.title} showBack={true} />
      <div className="container">
        <div className="detail flex flex-col gap-4 bg-white p-6 rounded-lg shadow-md mt-4">
          <h2 className="album-title text-2xl font-bold">{album.title}</h2>
          <p className="album-description text-gray-700">{album.description}</p>
          <div className="text-gray-600 text-sm">
            <p><strong>날짜:</strong> {album.date}</p>
            <p><strong>위치:</strong> {album.location.name} ({album.location.lat}, {album.location.lon})</p>
            <p><strong>날씨:</strong> {album.weather}</p>
          </div>

          <div className="detail-section">
            <h3 className="detail-title">사진들</h3>
            {album.photos.length > 0 ? (
              <PhotoGrid photos={album.photos} onPhotoClick={handlePhotoClick} />
            ) : (
              <p>이 앨범에는 사진이 없습니다.</p>
            )}
          </div>
        </div>
      </div>

      {fullscreenPhoto && (
        <FullscreenPhotoView
          photo={fullscreenPhoto}
          onClose={handleCloseFullscreen}
          onCaptionChange={handleCaptionChange}
          isEditing={isEditingCaption}
        />
      )}

      {fullscreenPhoto && (
        <div className="fixed bottom-4 right-4 z-50">
          <button
            onClick={toggleEditCaption}
            className="bg-primary text-white py-2 px-4 rounded-full shadow-lg"
          >
            {isEditingCaption ? '편집 완료' : '캡션 편집'}
          </button>
        </div>
      )}
    </div>
  );
};

// --- Next.js App Wrapper (simulating _app.js and pages) ---
// This part simulates how Next.js would route to different components
// In a real Next.js app, these would be separate files in the 'pages' directory.

function MyApp({ Component, pageProps }) {
  return (
    <AppProvider>
      <div className="body">
        <Component {...pageProps} />
      </div>
    </AppProvider>
  );
}

// Mocking Next.js Router for local execution context if needed
// In a real Next.js app, useRouter would work automatically.
const MockRouter = ({ children }) => {
  const [currentPath, setCurrentPath] = useState('/');
  const [query, setQuery] = useState({});

  useEffect(() => {
    const path = window.location.pathname;
    const pathParts = path.split('/');
    if (pathParts[1] === 'album' && pathParts[2]) {
      setCurrentPath('/album/[id]');
      setQuery({ id: pathParts[2] });
    } else if (path === '/create-album') {
      setCurrentPath('/create-album');
      setQuery({});
    } else {
      setCurrentPath('/');
      setQuery({});
    }

    const handlePopState = () => {
      const path = window.location.pathname;
      const pathParts = path.split('/');
      if (pathParts[1] === 'album' && pathParts[2]) {
        setCurrentPath('/album/[id]');
        setQuery({ id: pathParts[2] });
      } else if (path === '/create-album') {
        setCurrentPath('/create-album');
        setQuery({});
      } else {
        setCurrentPath('/');
        setQuery({});
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const router = {
    pathname: currentPath,
    query: query,
    push: (url) => {
      window.history.pushState({}, '', url);
      const pathParts = url.split('/');
      if (pathParts[1] === 'album' && pathParts[2]) {
        setCurrentPath('/album/[id]');
        setQuery({ id: pathParts[2] });
      } else if (url === '/create-album') {
        setCurrentPath('/create-album');
        setQuery({});
      } else {
        setCurrentPath('/');
        setQuery({});
      }
    },
    back: () => {
      window.history.back();
    }
  };

  // Override useRouter for this mock setup
  React.useRouter = () => router;

  let ComponentToRender;
  if (currentPath === '/') {
    ComponentToRender = HomePage;
  } else if (currentPath === '/create-album') {
    ComponentToRender = CreateAlbumPage;
  } else if (currentPath === '/album/[id]') {
    ComponentToRender = AlbumDetailPage;
  } else {
    ComponentToRender = () => <div className="body container text-center py-8">404 - 페이지를 찾을 수 없습니다.</div>;
  }

  return children(ComponentToRender, {});
};


// If this was a real Next.js project, the structure would be:
// pages/_app.js -> MyApp
// pages/index.js -> HomePage
// pages/create-album.js -> CreateAlbumPage
// pages/album/[id].js -> AlbumDetailPage
// components/Header.js
// components/AlbumCard.js
// components/PhotoGrid.js
// components/FullscreenPhotoView.js
// api/albums.js, api/upload.js, api/generate-pdf.js, api/weather.js

// To make this single file runnable (conceptually, not directly as Next.js app):
// This assumes a very simplified client-side routing.
// For actual execution, this would require a Next.js environment.

// For demonstration purposes, we'll create a root element and render the app.
// In a real Next.js app, this would be handled by the framework.
function RootApp() {
  return (
    <MockRouter>
      {(Component, pageProps) => <MyApp Component={Component} pageProps={pageProps} />}
    </MockRouter>
  );
}

export default RootApp; // Export the root component

// Important: This single 'app.js' file is a conceptual representation.
// In a real Next.js project, the code would be split into the respective
// 'pages/', 'components/', and 'api/' directories.
// The `MockAPI` and `MockRouter` are for self-containment and demonstration
// purposes within this single file requirement.
// Image paths (e.g., '/images/baby1.jpg') assume a 'public/images' directory
// in a Next.js project.
