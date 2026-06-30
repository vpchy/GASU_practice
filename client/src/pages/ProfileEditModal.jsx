import React, { useState, useEffect } from 'react'; 
import '../styles/profile-edit-modal.css'; 


function ProfileEditModal({ isOpen, onClose, userData, onSave }) { 
  // Инициализируем состояние. Если userData изменится, используем useEffect ниже
  const [formData, setFormData] = useState({ 
    name: userData?.name || 'Имя Фамилия', 
    username: userData?.username || 'username', 
    bio: userData?.bio || 'Здесь будет описание профиля', 
    location: userData?.location || 'Город', 
    avatar: userData?.avatar || null, 
  }); 

  const [avatarPreview, setAvatarPreview] = useState(userData?.avatar || null); 
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarError, setAvatarError] = useState("");

  // Синхронизируем внутреннее состояние формы, если внешние данные userData обновились
  useEffect(() => {
    if (userData) {
      setFormData({
        name: userData.name || 'Имя Фамилия',
        username: userData.username || 'username',
        bio: userData.bio || 'Здесь будет описание профиля',
        location: userData.location || 'Город',
        avatar: userData.avatar || null,
      });
      setAvatarPreview(userData.avatar || null);
      setAvatarFile(null);
      setAvatarError("");
    }
  }, [userData]);

  if (!isOpen) return null; 

  function handleChange(e) { 
    const { name, value } = e.target; 
    setFormData({ ...formData, [name]: value }); 
  } 

  function handleAvatarChange(e) { 
    const file = e.target.files[0]; 
    const allowedTypes = ["image/png", "image/jpeg"]; 

    if (!file) {
      setAvatarError("");
      return;
    }

    if (!allowedTypes.includes(file.type)) {
      setAvatarError("Только PNG, JPG или JPEG изображения.");
      setAvatarPreview(null);
      setAvatarFile(null);
      return;
    }

    setAvatarError("");
    setAvatarFile(file);
    const reader = new FileReader(); 
    reader.onload = (event) => { 
      setAvatarPreview(event.target.result); 
    }; 
    reader.readAsDataURL(file); 
  } 

  function handleSubmit(e) { 
    e.preventDefault(); 
    if (avatarError) return;
    onSave({ ...formData, avatarFile }); 
    onClose(); 
  } 


  return ( 
    <div className="modal-overlay" onClick={onClose}> 
      <div className="modal-edit" onClick={(e) => e.stopPropagation()}> 
        <div className="modal-header"> 
          <h2>Редактировать профиль</h2> 
          <button className="modal-close-btn" onClick={onClose}>✕</button> 
        </div> 
        
        <form onSubmit={handleSubmit}> 
          {/* ===== АВАТАР ===== */} 
          <div className="edit-avatar-section"> 
            <div className="edit-avatar-wrapper"> 
              {avatarPreview ? ( 
                <img src={avatarPreview} alt="Аватар" className="edit-avatar-img" /> 
              ) : ( 
                <div className="edit-avatar-placeholder">👤</div> 
              )} 
            </div> 
            <label className="edit-avatar-upload"> 
              Загрузить аватар 
              <input type="file" accept=".png,.jpg,.jpeg" onChange={handleAvatarChange} style={{ display: 'none' }} /> 
            </label> 
          </div> 
          {avatarError && <div className="edit-avatar-error">{avatarError}</div>} 

          {/* ===== ПОЛЯ ВВОДА ===== */} 
          <div className="edit-fields"> 
            <div className="edit-field-group"> 
              <label>Имя и фамилия</label> 
              <input 
                type="text" 
                name="name" 
                value={formData.name} 
                onChange={handleChange} 
                placeholder="Имя Фамилия" 
              /> 
            </div> 
            <div className="edit-field-group"> 
              <label>Никнейм</label> 
              <input 
                type="text" 
                name="username" 
                value={formData.username} 
                onChange={handleChange} 
                placeholder="@username" 
              /> 
            </div> 
            <div className="edit-field-group"> 
              <label>О себе</label> 
              <textarea 
                name="bio" 
                value={formData.bio} 
                onChange={handleChange} 
                placeholder="Расскажите о себе..." 
                rows={4} 
              /> 
            </div> 
            <div className="edit-field-group"> 
              <label>Город</label> 
              <input 
                type="text" 
                name="location" 
                value={formData.location} 
                onChange={handleChange} 
                placeholder="Город" 
              /> 
            </div> 
          </div> 

          {/* ===== КНОПКИ ДЕЙСТВИЯ ===== */} 
          <div className="edit-actions"> 
            <button type="button" className="edit-cancel-btn" onClick={onClose}> 
              Отмена 
            </button> 
            <button type="submit" className="edit-save-btn"> 
              Сохранить </button> 
          </div> 
        </form> 
      </div> 
    </div> 
  ); 
} 

export default ProfileEditModal;
