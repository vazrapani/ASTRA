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
  IonSelect,
  IonSelectOption,
  IonToggle,
  IonReorder,
  IonReorderGroup,
  IonGrid,
  IonRow,
  IonCol,
} from '@ionic/react';
import { add, image, close, trash, create, move } from 'ionicons/icons';
import { getAllSpreads, createSpread, updateSpread, deleteSpread, uploadSpreadImage } from '../../services/firebase/spreadService';
import { TarotSpread, SpreadPosition } from '../../types';
import CommonHeader from '../../components/CommonHeader';
import styles from './SpreadsPage.module.css';
import { v4 as uuidv4 } from 'uuid';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { useHistory } from 'react-router-dom';

const SpreadsPage: React.FC = () => {
  const [spreads, setSpreads] = useState<TarotSpread[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedSpread, setSelectedSpread] = useState<TarotSpread | null>(null);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [presentToast] = useIonToast();

  // 폼 상태
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    positions: [] as SpreadPosition[],
    cardCount: 0,
    difficulty: 'beginner' as 'beginner' | 'intermediate' | 'advanced',
    category: [] as string[],
    isActive: true,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [newCategory, setNewCategory] = useState('');
  const [newPosition, setNewPosition] = useState({
    name: '',
    description: '',
  });

  const user = useSelector((state: RootState) => state.auth.user);

  const [filter, setFilter] = useState({
    name: '',
    category: '',
    difficulty: '',
    dateRange: { start: '', end: '' },
  });

  const [actionLoading, setActionLoading] = useState(false);

  const history = useHistory();

  // 스프레드 목록 로드
  const loadSpreads = async () => {
    try {
      const spreads = await getAllSpreads();
      setSpreads(spreads);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load spreads:', error);
      presentToast({
        message: '스프레드 목록을 불러오는데 실패했습니다.',
        duration: 3000,
        color: 'danger',
      });
    }
  };

  useEffect(() => {
    loadSpreads();
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

  // 카테고리 추가
  const handleAddCategory = () => {
    if (newCategory.trim()) {
      setFormData(prev => ({
        ...prev,
        category: [...prev.category, newCategory.trim()]
      }));
      setNewCategory('');
    }
  };

  // 카테고리 삭제
  const handleRemoveCategory = (index: number) => {
    setFormData(prev => ({
      ...prev,
      category: prev.category.filter((_, i) => i !== index)
    }));
  };

  // 포지션 추가
  const handleAddPosition = () => {
    if (newPosition.name.trim() && newPosition.description.trim()) {
      const position: SpreadPosition = {
        id: uuidv4(),
        index: formData.positions.length,
        name: newPosition.name,
        description: newPosition.description,
        x: 0,
        y: 0,
      };

      setFormData(prev => ({
        ...prev,
        positions: [...prev.positions, position],
        cardCount: prev.cardCount + 1,
      }));

      setNewPosition({
        name: '',
        description: '',
      });
    }
  };

  // 포지션 삭제
  const handleRemovePosition = (index: number) => {
    setFormData(prev => ({
      ...prev,
      positions: prev.positions.filter((_, i) => i !== index),
      cardCount: prev.cardCount - 1,
    }));
  };

  // 포지션 순서 변경
  const handleReorderPositions = (event: CustomEvent) => {
    const newPositions = [...formData.positions];
    event.detail.complete(newPositions);
    
    // 인덱스 업데이트
    const updatedPositions = newPositions.map((pos, idx) => ({
      ...pos,
      index: idx,
    }));

    setFormData(prev => ({
      ...prev,
      positions: updatedPositions,
    }));
  };

  // 폼 초기화
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      positions: [],
      cardCount: 0,
      difficulty: 'beginner',
      category: [],
      isActive: true,
    });
    setImageFile(null);
    setImagePreview('');
    setSelectedSpread(null);
    setNewPosition({
      name: '',
      description: '',
    });
  };

  // 스프레드 편집 시작
  const handleEditSpread = (spread: TarotSpread) => {
    setSelectedSpread(spread);
    setFormData({
      name: spread.name,
      description: spread.description,
      positions: spread.positions,
      cardCount: spread.cardCount,
      difficulty: spread.difficulty,
      category: spread.category,
      isActive: spread.isActive,
    });
    setImagePreview(spread.imageUrl || '');
    setShowModal(true);
  };

  // 스프레드 저장
  const handleSave = async () => {
    try {
      let imageUrl = selectedSpread?.imageUrl || '';
      
      if (imageFile) {
        imageUrl = await uploadSpreadImage(imageFile);
      }

      const spreadData = {
        ...formData,
        imageUrl,
      };

      if (selectedSpread) {
        await updateSpread(selectedSpread.id, spreadData, user?.id);
        presentToast({
          message: '스프레드가 수정되었습니다.',
          duration: 2000,
          color: 'success',
        });
      } else {
        await createSpread(spreadData, user?.id);
        presentToast({
          message: '새 스프레드가 생성되었습니다.',
          duration: 2000,
          color: 'success',
        });
      }

      resetForm();
      setShowModal(false);
      loadSpreads();
    } catch (error) {
      console.error('Failed to save spread:', error);
      presentToast({
        message: '스프레드 저장에 실패했습니다.',
        duration: 3000,
        color: 'danger',
      });
    }
  };

  // 스프레드 삭제
  const handleDelete = async () => {
    if (!selectedSpread) return;
    setActionLoading(true);
    try {
      await deleteSpread(selectedSpread.id, user?.id);
      presentToast({
        message: '스프레드가 삭제되었습니다.',
        duration: 2000,
        color: 'success',
      });
      resetForm();
      setShowModal(false);
      setShowDeleteAlert(false);
      loadSpreads();
    } catch (error) {
      console.error('Failed to delete spread:', error);
      presentToast({
        message: '스프레드 삭제에 실패했습니다.',
        duration: 3000,
        color: 'danger',
      });
    } finally {
      setActionLoading(false);
    }
  };

  // 필터링된 스프레드 목록
  const filteredSpreads = spreads.filter(spread => {
    const nameMatch = spread.name.toLowerCase().includes(filter.name.toLowerCase());
    const categoryMatch = filter.category ? (spread.category && spread.category.some((c: string) => c.toLowerCase().includes(filter.category.toLowerCase()))) : true;
    const difficultyMatch = filter.difficulty ? spread.difficulty === filter.difficulty : true;
    const dateStart = filter.dateRange.start ? new Date(filter.dateRange.start).getTime() : null;
    const dateEnd = filter.dateRange.end ? new Date(filter.dateRange.end).getTime() : null;
    const createdAt = spread.createdAt || 0;
    const dateMatch = (!dateStart || createdAt >= dateStart) && (!dateEnd || createdAt <= dateEnd + 24*60*60*1000-1);
    return nameMatch && categoryMatch && difficultyMatch && dateMatch;
  });

  return (
    <IonPage>
      <CommonHeader title="스프레드 관리" backHref="/admin/dashboard" onClickBack={() => history.goBack()} />
      <IonContent>
        <div className={styles.filterSection}>
          <IonGrid>
            <IonRow>
              <IonCol size="6">
                <IonInput placeholder="스프레드명 검색" value={filter.name} onIonChange={e => setFilter(f => ({...f, name: e.detail.value!}))} />
              </IonCol>
              <IonCol size="6">
                <IonInput placeholder="카테고리 검색" value={filter.category} onIonChange={e => setFilter(f => ({...f, category: e.detail.value!}))} />
              </IonCol>
            </IonRow>
            <IonRow>
              <IonCol size="6">
                <IonSelect placeholder="난이도" value={filter.difficulty} onIonChange={e => setFilter(f => ({...f, difficulty: e.detail.value!}))}>
                  <IonSelectOption value="">전체</IonSelectOption>
                  <IonSelectOption value="beginner">초급</IonSelectOption>
                  <IonSelectOption value="intermediate">중급</IonSelectOption>
                  <IonSelectOption value="advanced">고급</IonSelectOption>
                </IonSelect>
              </IonCol>
              <IonCol size="6"></IonCol>
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
                <IonButton size="small" onClick={loadSpreads}>검색</IonButton>
              </IonCol>
            </IonRow>
          </IonGrid>
        </div>
        {loading ? (
          <div className={`${styles.centerText} ${styles.margin40}`}>
            <IonSpinner name="crescent" />
            <div className={styles.marginTop12}>스프레드 목록을 불러오는 중...</div>
          </div>
        ) : filteredSpreads.length === 0 ? (
          <div className={`${styles.centerText} ${styles.margin40} ${styles.fontGray} ${styles.fontSize1_1em}`}>
            스프레드가 없습니다.
          </div>
        ) : (
          <IonList>
            {filteredSpreads.map(spread => (
              <div key={spread.id} className={styles.spreadItem} onClick={() => handleEditSpread(spread)}>
                <img src={spread.imageUrl} alt={spread.name} className={styles.spreadImage} />
                <div className={styles.spreadContent}>
                  <div className={styles.spreadName}>{spread.name}</div>
                  <div className={styles.spreadDescription}>{spread.description}</div>
                  <div className={styles.spreadInfo}>
                    <span>{spread.cardCount}장</span>
                    <span className={`${styles.spreadStatus} ${spread.isActive ? styles.statusActive : styles.statusInactive}`}>
                      {spread.isActive ? '활성' : '비활성'}
                    </span>
                  </div>
                  <div className={styles.categoryChips}>
                    {spread.category.map((cat, index) => (
                      <IonChip key={index} color="primary">{cat}</IonChip>
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
          <CommonHeader title={selectedSpread ? '스프레드 수정' : '새 스프레드 추가'} onClickBack={() => setShowModal(false)} />
          <IonContent className={styles.modalContent}>
            <IonList>
              <IonItem>
                <IonLabel position="stacked">스프레드 이름</IonLabel>
                <IonInput
                  value={formData.name}
                  onIonChange={e => setFormData(prev => ({ ...prev, name: e.detail.value || '' }))}
                  placeholder="스프레드의 이름을 입력하세요"
                />
              </IonItem>

              <IonItem>
                <IonLabel position="stacked">설명</IonLabel>
                <IonTextarea
                  value={formData.description}
                  onIonChange={e => setFormData(prev => ({ ...prev, description: e.detail.value || '' }))}
                  placeholder="스프레드에 대한 설명을 입력하세요"
                  rows={4}
                />
              </IonItem>

              <div 
                className={styles.imageUpload}
                onClick={() => fileInputRef.current?.click()}
              >
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className={styles.previewImage} />
                ) : (
                  <>
                    <IonIcon icon={image} size="large" />
                    <p>클릭하여 이미지 업로드</p>
                  </>
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
                <IonLabel position="stacked">난이도</IonLabel>
                <IonSelect
                  value={formData.difficulty}
                  onIonChange={e => setFormData(prev => ({ ...prev, difficulty: e.detail.value }))}
                >
                  <IonSelectOption value="beginner">초급</IonSelectOption>
                  <IonSelectOption value="intermediate">중급</IonSelectOption>
                  <IonSelectOption value="advanced">고급</IonSelectOption>
                </IonSelect>
              </IonItem>

              <IonItem>
                <IonLabel position="stacked">카테고리</IonLabel>
                <IonInput
                  value={newCategory}
                  onIonChange={e => setNewCategory(e.detail.value || '')}
                  placeholder="카테고리를 입력하고 Enter를 누르세요"
                  onKeyPress={e => {
                    if (e.key === 'Enter') {
                      handleAddCategory();
                    }
                  }}
                />
              </IonItem>
              <div className={styles.categoryChips}>
                {formData.category.map((cat, index) => (
                  <IonChip
                    key={index}
                    onClick={() => handleRemoveCategory(index)}
                  >
                    <IonLabel>{cat}</IonLabel>
                    <IonIcon icon={close} />
                  </IonChip>
                ))}
              </div>

              <IonItem>
                <IonLabel>활성화</IonLabel>
                <IonToggle
                  checked={formData.isActive}
                  onIonChange={e => setFormData(prev => ({ ...prev, isActive: e.detail.checked }))}
                />
              </IonItem>

              <div className={styles.modalTitle + ' ' + styles.marginTop24}>
                카드 포지션 설정
              </div>

              <IonItem>
                <IonLabel position="stacked">포지션 이름</IonLabel>
                <IonInput
                  value={newPosition.name}
                  onIonChange={e => setNewPosition(prev => ({ ...prev, name: e.detail.value || '' }))}
                  placeholder="예: 과거, 현재, 미래"
                />
              </IonItem>

              <IonItem>
                <IonLabel position="stacked">포지션 설명</IonLabel>
                <IonTextarea
                  value={newPosition.description}
                  onIonChange={e => setNewPosition(prev => ({ ...prev, description: e.detail.value || '' }))}
                  placeholder="이 포지션이 의미하는 바를 설명하세요"
                  rows={3}
                />
              </IonItem>

              <IonButton
                expand="block"
                onClick={handleAddPosition}
                disabled={!newPosition.name || !newPosition.description}
                className={styles.margin16}
              >
                포지션 추가
              </IonButton>

              <IonReorderGroup disabled={false} onIonItemReorder={handleReorderPositions}>
                {formData.positions.map((position, index) => (
                  <div key={position.id} className={styles.positionItem}>
                    <IonReorder>
                      <IonIcon icon={move} />
                    </IonReorder>
                    <div className={styles.positionNumber}>{index + 1}</div>
                    <div className={styles.positionDetails}>
                      <strong>{position.name}</strong>
                      <p>{position.description}</p>
                    </div>
                    <IonButton
                      fill="clear"
                      color="danger"
                      onClick={() => handleRemovePosition(index)}
                    >
                      <IonIcon icon={trash} />
                    </IonButton>
                  </div>
                ))}
              </IonReorderGroup>
            </IonList>

            <div className="ion-padding">
              <IonButton expand="block" onClick={handleSave}>
                {selectedSpread ? '수정하기' : '추가하기'}
              </IonButton>
              
              {selectedSpread && (
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
          header="스프레드 삭제"
          message="정말 이 스프레드를 삭제하시겠습니까?"
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
      </IonContent>
    </IonPage>
  );
};

export default SpreadsPage; 