import React, { useEffect, useState, useRef } from 'react';
import {
  IonPage,
  IonContent,
  IonButton,
  IonIcon,
  IonSearchbar,
  IonModal,
  IonItem,
  IonLabel,
  IonInput,
  IonTextarea,
  IonChip,
  IonSpinner,
  useIonToast,
  IonFab,
  IonFabButton,
  IonList,
  IonAlert,
  IonGrid,
  IonRow,
  IonCol,
} from '@ionic/react';
import { add, image, close, trash, create } from 'ionicons/icons';
import { getAllCards, createCard, updateCard, deleteCard, uploadCardImage } from '../../services/firebase/cardService';
import { TarotCard } from '../../types';
import CommonHeader from '../../components/CommonHeader';
import styles from './CardsPage.module.css';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { useHistory } from 'react-router-dom';

const CardsPage: React.FC = () => {
  const [cards, setCards] = useState<TarotCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedCard, setSelectedCard] = useState<TarotCard | null>(null);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [presentToast] = useIonToast();

  // 폼 상태
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    keywords: [] as string[],
    upright: [] as string[],
    reversed: [] as string[],
    element: '',
    zodiac: '',
    planet: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const user = useSelector((state: RootState) => state.auth.user);

  const [filter, setFilter] = useState({
    name: '',
    keyword: '',
    element: '',
    zodiac: '',
    dateRange: { start: '', end: '' },
  });

  const [actionLoading, setActionLoading] = useState(false);

  const history = useHistory();

  // 카드 목록 로드
  const loadCards = async () => {
    try {
      const cards = await getAllCards();
      setCards(cards);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load cards:', error);
      presentToast({
        message: '카드 목록을 불러오는데 실패했습니다.',
        duration: 3000,
        color: 'danger',
      });
    }
  };

  useEffect(() => {
    loadCards();
  }, []);

  // 이미지 선택 처리
  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // 키워드 추가
  const handleAddKeyword = (type: 'keywords' | 'upright' | 'reversed', value: string) => {
    if (value.trim()) {
      setFormData(prev => ({
        ...prev,
        [type]: [...prev[type], value.trim()]
      }));
    }
  };

  // 키워드 삭제
  const handleRemoveKeyword = (type: 'keywords' | 'upright' | 'reversed', index: number) => {
    setFormData(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index)
    }));
  };

  // 폼 초기화
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      keywords: [],
      upright: [],
      reversed: [],
      element: '',
      zodiac: '',
      planet: '',
    });
    setImageFile(null);
    setImagePreview('');
    setSelectedCard(null);
  };

  // 카드 편집 시작
  const handleEditCard = (card: TarotCard) => {
    setSelectedCard(card);
    setFormData({
      name: card.name,
      description: card.description || '',
      keywords: card.keywords || [],
      upright: card.upright || [],
      reversed: card.reversed || [],
      element: card.element || '',
      zodiac: card.zodiac || '',
      planet: card.planet || '',
    });
    setImagePreview(card.imageUrl || '');
    setShowModal(true);
  };

  // 카드 저장
  const handleSave = async () => {
    try {
      let imageUrl = selectedCard?.imageUrl || '';
      
      if (imageFile) {
        imageUrl = await uploadCardImage(imageFile);
      }

      const cardData = {
        ...formData,
        imageUrl,
      };

      if (selectedCard) {
        await updateCard(selectedCard.id, cardData, user?.id);
        presentToast({
          message: '카드가 수정되었습니다.',
          duration: 2000,
          color: 'success',
        });
      } else {
        await createCard(cardData, user?.id);
        presentToast({
          message: '새 카드가 생성되었습니다.',
          duration: 2000,
          color: 'success',
        });
      }

      resetForm();
      setShowModal(false);
      loadCards();
    } catch (error) {
      console.error('Failed to save card:', error);
      presentToast({
        message: '카드 저장에 실패했습니다.',
        duration: 3000,
        color: 'danger',
      });
    }
  };

  // 카드 삭제
  const handleDelete = async () => {
    if (!selectedCard) return;
    setActionLoading(true);
    try {
      await deleteCard(selectedCard.id, user?.id);
      presentToast({
        message: '카드가 삭제되었습니다.',
        duration: 2000,
        color: 'success',
      });
      resetForm();
      setShowModal(false);
      setShowDeleteAlert(false);
      loadCards();
    } catch (error) {
      console.error('Failed to delete card:', error);
      presentToast({
        message: '카드 삭제에 실패했습니다.',
        duration: 3000,
        color: 'danger',
      });
    } finally {
      setActionLoading(false);
    }
  };

  // 필터링된 카드 목록
  const filteredCards = cards.filter(card => {
    const nameMatch = card.name.toLowerCase().includes(filter.name.toLowerCase());
    const keywordMatch = filter.keyword ? (card.keywords && card.keywords.some((k: string) => k.toLowerCase().includes(filter.keyword.toLowerCase()))) : true;
    const elementMatch = filter.element ? (card.element && card.element.includes(filter.element)) : true;
    const zodiacMatch = filter.zodiac ? (card.zodiac && card.zodiac.includes(filter.zodiac)) : true;
    const dateStart = filter.dateRange.start ? new Date(filter.dateRange.start).getTime() : null;
    const dateEnd = filter.dateRange.end ? new Date(filter.dateRange.end).getTime() : null;
    const createdAt = card.createdAt || 0;
    const dateMatch = (!dateStart || createdAt >= dateStart) && (!dateEnd || createdAt <= dateEnd + 24*60*60*1000-1);
    return nameMatch && keywordMatch && elementMatch && zodiacMatch && dateMatch;
  });

  return (
    <IonPage>
      <CommonHeader title="카드 관리" backHref="/admin/dashboard" onClickBack={() => history.goBack()} />
      <IonSearchbar
        placeholder="카드명 또는 키워드 검색"
        value={searchText}
        onIonChange={e => setSearchText(e.detail.value!)}
        debounce={300}
      />
      <div className={styles.filterSection}>
        <IonGrid>
          <IonRow>
            <IonCol size="6">
              <IonInput placeholder="카드명 검색" value={filter.name} onIonChange={e => setFilter(f => ({...f, name: e.detail.value!}))} />
            </IonCol>
            <IonCol size="6">
              <IonInput placeholder="키워드 검색" value={filter.keyword} onIonChange={e => setFilter(f => ({...f, keyword: e.detail.value!}))} />
            </IonCol>
          </IonRow>
          <IonRow>
            <IonCol size="6">
              <IonInput placeholder="원소 검색" value={filter.element} onIonChange={e => setFilter(f => ({...f, element: e.detail.value!}))} />
            </IonCol>
            <IonCol size="6">
              <IonInput placeholder="별자리 검색" value={filter.zodiac} onIonChange={e => setFilter(f => ({...f, zodiac: e.detail.value!}))} />
            </IonCol>
          </IonRow>
          <IonRow>
            <IonCol size="6">
              <IonLabel>생성일(시작)</IonLabel>
              <IonInput type="date" value={filter.dateRange.start} onIonChange={e => setFilter(f => ({...f, dateRange: {...f.dateRange, start: e.detail.value!}}))} />
            </IonCol>
            <IonCol size="6">
              <IonLabel>생성일(종료)</IonLabel>
              <IonInput type="date" value={filter.dateRange.end} onIonChange={e => setFilter(f => ({...f, dateRange: {...f.dateRange, end: e.detail.value!}}))} />
            </IonCol>
          </IonRow>
          <IonRow>
            <IonCol size="12" className={styles.textRight}>
              <IonButton size="small" onClick={loadCards}>검색</IonButton>
            </IonCol>
          </IonRow>
        </IonGrid>
      </div>
      {loading ? (
        <div className={styles.center40}>
          <IonSpinner name="crescent" />
          <div className={styles.mt12}>카드 목록을 불러오는 중...</div>
        </div>
      ) : filteredCards.length === 0 ? (
        <div className={styles.center40Gray}>
          카드가 없습니다.
        </div>
      ) : (
        <IonList>
          {filteredCards.map(card => (
            <div key={card.id} className={styles.cardItem} onClick={() => handleEditCard(card)}>
              <img src={card.imageUrl} alt={card.name} className={styles.cardImage} />
              <div className={styles.cardContent}>
                <div className={styles.cardName}>{card.name}</div>
                <div className={styles.cardDescription}>{card.description}</div>
                <div className={styles.keywordChips}>
                  {card.keywords?.slice(0, 3).map((keyword, index) => (
                    <IonChip key={index} color="primary">{keyword}</IonChip>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </IonList>
      )}

      <IonFab vertical="bottom" horizontal="end" slot="fixed">
        <IonFabButton onClick={() => {
          resetForm();
          setShowModal(true);
        }}>
          <IonIcon icon={add} />
        </IonFabButton>
      </IonFab>

      <IonModal isOpen={showModal} onDidDismiss={() => setShowModal(false)}>
        <CommonHeader title={selectedCard ? '카드 수정' : '새 카드 추가'} onClickBack={() => setShowModal(false)} />
        <IonContent className={styles.modalContent}>
          <IonList>
            <IonItem>
              <IonLabel position="stacked">카드 이름</IonLabel>
              <IonInput
                value={formData.name}
                onIonChange={e => setFormData(prev => ({ ...prev, name: e.detail.value || '' }))}
                placeholder="카드의 이름을 입력하세요"
              />
            </IonItem>

            <IonItem>
              <IonLabel position="stacked">설명</IonLabel>
              <IonTextarea
                value={formData.description}
                onIonChange={e => setFormData(prev => ({ ...prev, description: e.detail.value || '' }))}
                placeholder="카드에 대한 설명을 입력하세요"
                rows={4}
              />
            </IonItem>

            <div 
              className={styles.imageUpload}
              onClick={() => fileInputRef.current?.click()}
            >
              {imagePreview && (
                <img src={imagePreview} alt="Preview" className={styles.previewImage} />
              )}
              <input
                type="file"
                ref={fileInputRef}
                hidden
                accept="image/*"
                onChange={handleImageSelect}
              />
            </div>

            <IonItem>
              <IonLabel position="stacked">키워드</IonLabel>
              <IonInput
                placeholder="키워드를 입력하고 Enter를 누르세요"
                onKeyPress={e => {
                  if (e.key === 'Enter') {
                    const input = e.target as HTMLIonInputElement;
                    handleAddKeyword('keywords', input.value?.toString() || '');
                    input.value = '';
                  }
                }}
              />
            </IonItem>
            <div className={styles.keywordChips}>
              {formData.keywords.map((keyword, index) => (
                <IonChip
                  key={index}
                  onClick={() => handleRemoveKeyword('keywords', index)}
                >
                  <IonLabel>{keyword}</IonLabel>
                  <IonIcon icon={close} />
                </IonChip>
              ))}
            </div>

            <IonItem>
              <IonLabel position="stacked">정방향 의미</IonLabel>
              <IonInput
                placeholder="정방향 의미를 입력하고 Enter를 누르세요"
                onKeyPress={e => {
                  if (e.key === 'Enter') {
                    const input = e.target as HTMLIonInputElement;
                    handleAddKeyword('upright', input.value?.toString() || '');
                    input.value = '';
                  }
                }}
              />
            </IonItem>
            <div className={styles.keywordChips}>
              {formData.upright.map((meaning, index) => (
                <IonChip
                  key={index}
                  onClick={() => handleRemoveKeyword('upright', index)}
                >
                  <IonLabel>{meaning}</IonLabel>
                  <IonIcon icon={close} />
                </IonChip>
              ))}
            </div>

            <IonItem>
              <IonLabel position="stacked">역방향 의미</IonLabel>
              <IonInput
                placeholder="역방향 의미를 입력하고 Enter를 누르세요"
                onKeyPress={e => {
                  if (e.key === 'Enter') {
                    const input = e.target as HTMLIonInputElement;
                    handleAddKeyword('reversed', input.value?.toString() || '');
                    input.value = '';
                  }
                }}
              />
            </IonItem>
            <div className={styles.keywordChips}>
              {formData.reversed.map((meaning, index) => (
                <IonChip
                  key={index}
                  onClick={() => handleRemoveKeyword('reversed', index)}
                >
                  <IonLabel>{meaning}</IonLabel>
                  <IonIcon icon={close} />
                </IonChip>
              ))}
            </div>

            <IonItem>
              <IonLabel position="stacked">원소</IonLabel>
              <IonInput
                value={formData.element}
                onIonChange={e => setFormData(prev => ({ ...prev, element: e.detail.value || '' }))}
                placeholder="예: 불, 물, 흙, 공기"
              />
            </IonItem>

            <IonItem>
              <IonLabel position="stacked">별자리</IonLabel>
              <IonInput
                value={formData.zodiac}
                onIonChange={e => setFormData(prev => ({ ...prev, zodiac: e.detail.value || '' }))}
                placeholder="예: 양자리, 물고기자리"
              />
            </IonItem>

            <IonItem>
              <IonLabel position="stacked">행성</IonLabel>
              <IonInput
                value={formData.planet}
                onIonChange={e => setFormData(prev => ({ ...prev, planet: e.detail.value || '' }))}
                placeholder="예: 태양, 달, 화성"
              />
            </IonItem>
          </IonList>

          <div className="ion-padding">
            <IonButton expand="block" onClick={handleSave}>
              {selectedCard ? '수정하기' : '추가하기'}
            </IonButton>
            
            {selectedCard && (
              <IonButton 
                expand="block" 
                color="danger"
                className={styles.deleteButton}
                onClick={() => setShowDeleteAlert(true)}
                disabled={actionLoading}
              >
                {actionLoading ? <IonSpinner name="dots" /> : <><IonIcon slot="start" icon={trash} />삭제하기</>}
              </IonButton>
            )}
            
            <IonButton 
              expand="block" 
              fill="outline" 
              onClick={() => {
                resetForm();
                setShowModal(false);
              }}
            >
              취소
            </IonButton>
          </div>
        </IonContent>
      </IonModal>

      <IonAlert
        isOpen={showDeleteAlert}
        onDidDismiss={() => setShowDeleteAlert(false)}
        header="카드 삭제"
        message="정말 이 카드를 삭제하시겠습니까?"
        buttons={[
          {
            text: '취소',
            role: 'cancel',
            handler: () => !actionLoading
          },
          {
            text: '삭제',
            role: 'destructive',
            handler: () => !actionLoading && handleDelete()
          },
        ]}
      />
    </IonPage>
  );
};

export default CardsPage; 