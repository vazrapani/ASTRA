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
  addDoc,
  Timestamp,
  onSnapshot
} from 'firebase/firestore';
import {
  TarotCard,
  DeckType,
  CardOrientation,
  DailyTarotResult
} from '../../types/tarot';
import {
  getRandomDeck,
  getRandomCard,
  getRandomOrientation
} from '../../utils/tarotCards';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1초

interface DailyTarotStatus {
  isDailyAvailable: boolean;
  result: DailyTarotResult | null;
}

class TarotService {
  private subscriptions: { [key: string]: () => void } = {};

  private async retryOperation<T>(operation: () => Promise<T>, retries = MAX_RETRIES): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      if (retries > 0) {
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        return this.retryOperation(operation, retries - 1);
      }
      throw error;
    }
  }

  private getDailyTarotRef(userId: string) {
    return doc(collection(doc(db, 'users', userId), 'dailyTarotResult'), 'current');
  }

  // 실시간 업데이트 구독
  public subscribeToDailyTarot(userId: string, callback: (result: DailyTarotResult | null) => void) {
    if (this.subscriptions[userId]) {
      this.subscriptions[userId]();
    }

    const ref = this.getDailyTarotRef(userId);
    this.subscriptions[userId] = onSnapshot(ref, (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.data() as DailyTarotResult);
      } else {
        callback(null);
      }
    }, (error) => {
      console.error('Error subscribing to daily tarot:', error);
      callback(null);
    });
  }

  // 구독 해제
  public unsubscribeFromDailyTarot(userId: string) {
    if (this.subscriptions[userId]) {
      this.subscriptions[userId]();
      delete this.subscriptions[userId];
    }
  }

  // 오늘의 타로 상태 확인
  async getDailyTarotStatus(userId: string): Promise<DailyTarotStatus> {
    return this.retryOperation(async () => {
      try {
        const dailyTarotRef = this.getDailyTarotRef(userId);
        const dailyTarotDoc = await getDoc(dailyTarotRef);
        
        if (!dailyTarotDoc.exists()) {
          return { isDailyAvailable: true, result: null };
        }

        const data = dailyTarotDoc.data() as DailyTarotResult;
        const today = new Date().toISOString().split('T')[0];
        
        if (data.date !== today) {
          return { isDailyAvailable: true, result: null };
        }

        return {
          isDailyAvailable: false,
          result: data
        };
      } catch (error) {
        console.error('Error getting daily tarot status:', error);
        throw error;
      }
    });
  }

  // 오늘의 타로 저장
  async saveDailyTarotReading(
    userId: string,
    deck: DeckType,
    card: TarotCard,
    orientation: CardOrientation,
    interpretation: string
  ): Promise<DailyTarotResult> {
    return this.retryOperation(async () => {
      const today = new Date().toISOString().split('T')[0];
      const dailyTarotRef = this.getDailyTarotRef(userId);
      
      const result: DailyTarotResult = {
        userId,
        date: today,
        deck,
        card,
        orientation,
        interpretation
      };

      await setDoc(dailyTarotRef, result);
      return result;
    });
  }
}

export const tarotService = new TarotService();

// 메서드를 직접 export하지 않고, 클래스 인스턴스만 export
export default tarotService; 