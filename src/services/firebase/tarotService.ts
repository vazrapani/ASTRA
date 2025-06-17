import { db } from '../../config/firebase';
import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  serverTimestamp,
  query,
  where,
  getDocs,
  addDoc
} from 'firebase/firestore';
import { Timestamp } from 'firebase/firestore';

// 오늘의 타로 관련 타입
interface DailyTarotResult {
  date: string;  // YYYY-MM-DD 형식
  cardIndex: number;
  interpretation: string;
  createdAt: any;  // Firestore Timestamp
}

interface DailyTarotStatus {
  isDailyAvailable: boolean;
  result: {
    card: {
      name: string;
      meaning: string;
    };
    date: Date;
  } | null;
}

class TarotService {
  public getDailyTarotRef(userId: string) {
    return doc(collection(doc(db, 'users', userId), 'dailyTarotResult'), 'current');
  }

  // 오늘의 타로 초기화 여부 확인
  async checkDailyTarotReset(userId: string): Promise<boolean> {
    const today = new Date().toISOString().split('T')[0];
    const dailyTarotRef = this.getDailyTarotRef(userId);
    const dailyTarotDoc = await getDoc(dailyTarotRef);

    if (!dailyTarotDoc.exists()) {
      return true;  // 첫 사용자는 초기화 필요
    }

    const data = dailyTarotDoc.data() as DailyTarotResult;
    return data.date !== today;
  }

  // 오늘의 타로 초기화
  async resetDailyTarot(userId: string) {
    const today = new Date().toISOString().split('T')[0];
    const needsReset = await this.checkDailyTarotReset(userId);

    if (needsReset) {
      const dailyTarotRef = this.getDailyTarotRef(userId);
      
      await setDoc(dailyTarotRef, {
        date: today,
        cardIndex: this.getRandomCardIndex(),
        interpretation: '',
        createdAt: serverTimestamp()
      });

      return true;
    }

    return false;
  }

  private getRandomCardIndex(): number {
    // TODO: 실제 타로 카드 데이터와 연동
    return Math.floor(Math.random() * 78);  // 타로 카드는 총 78장
  }
}

export const tarotService = new TarotService();

export const getDailyTarotStatus = async (userId: string): Promise<DailyTarotStatus> => {
  try {
    // 서버 시간 기준으로 오늘 날짜의 시작과 끝 계산
    const now = Timestamp.now();
    const today = new Date(now.toDate());
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const dailyReadingsRef = collection(db, 'readings');
    const dailyQuery = query(
      dailyReadingsRef,
      where('userId', '==', userId),
      where('type', '==', 'daily'),
      where('createdAt', '>=', Timestamp.fromDate(today)),
      where('createdAt', '<', Timestamp.fromDate(tomorrow))
    );

    const querySnapshot = await getDocs(dailyQuery);
    const dailyReading = querySnapshot.docs[0]?.data();

    return {
      isDailyAvailable: querySnapshot.empty,
      result: dailyReading ? {
        card: {
          name: dailyReading.card.name,
          meaning: dailyReading.card.meaning
        },
        date: dailyReading.createdAt.toDate()
      } : null
    };
  } catch (error) {
    console.error('Error checking daily tarot status:', error);
    throw error;
  }
};

export const saveDailyTarotReading = async (userId: string, cardData: any): Promise<{ card: any; date: Date }> => {
  try {
    const readingsRef = collection(db, 'readings');
    const reading = {
      userId,
      type: 'daily',
      card: cardData,
      createdAt: serverTimestamp(),
    };

    // Add the reading document
    await addDoc(readingsRef, reading);

    return {
      card: cardData,
      date: new Date()
    };
  } catch (error) {
    console.error('Error saving daily tarot reading:', error);
    throw error;
  }
}; 