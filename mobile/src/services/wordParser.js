import * as FileSystem from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';

class WordParser {
  constructor() {
    this.supportedFormats = ['.docx', '.doc'];
  }

  /**
   * Парсит Word-документ и извлекает карточки
   * Карточки разделяются строками с пропуском (не обычным Enter)
   */
  async parseWordDocument(uri) {
    try {
      // Читаем файл
      const fileContent = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      // Парсим содержимое
      const cards = this.extractCardsFromContent(fileContent);
      
      return {
        success: true,
        cards,
        count: cards.length,
      };
    } catch (error) {
      console.error('Error parsing Word document:', error);
      return {
        success: false,
        error: error.message,
        cards: [],
        count: 0,
      };
    }
  }

  /**
   * Извлекает карточки из содержимого документа
   */
  extractCardsFromContent(content) {
    // Разделяем содержимое на карточки
    // Карточки разделяются строками с пропуском (не обычным Enter)
    const cardSeparator = /\n\s*\n/; // Два или более символа новой строки подряд
    const rawCards = content.split(cardSeparator);

    const cards = rawCards
      .map(card => this.cleanCardText(card))
      .filter(card => card.length > 0)
      .map((card, index) => ({
        id: index + 1,
        text: card,
        source: 'word_document',
      }));

    return cards;
  }

  /**
   * Очищает текст карточки от лишних символов
   */
  cleanCardText(text) {
    return text
      .replace(/\r\n/g, '\n') // Заменяем Windows переносы строк
      .replace(/\r/g, '\n') // Заменяем Mac переносы строк
      .replace(/\n+/g, '\n') // Убираем множественные переносы
      .replace(/^\s+|\s+$/g, '') // Убираем пробелы в начале и конце
      .replace(/\s+/g, ' ') // Заменяем множественные пробелы на один
      .trim();
  }

  /**
   * Показывает диалог выбора документа
   */
  async pickDocument() {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        copyToCacheDirectory: true,
      });

      if (result.type === 'success') {
        return {
          success: true,
          uri: result.uri,
          name: result.name,
          size: result.size,
        };
      } else {
        return {
          success: false,
          error: 'Документ не выбран',
        };
      }
    } catch (error) {
      console.error('Error picking document:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Валидирует выбранный документ
   */
  validateDocument(document) {
    if (!document) {
      return { valid: false, error: 'Документ не выбран' };
    }

    if (!document.uri) {
      return { valid: false, error: 'Неверный URI документа' };
    }

    // Проверяем размер файла (максимум 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (document.size && document.size > maxSize) {
      return { valid: false, error: 'Файл слишком большой (максимум 10MB)' };
    }

    // Проверяем расширение файла
    const fileName = document.name || '';
    const hasValidExtension = this.supportedFormats.some(format => 
      fileName.toLowerCase().endsWith(format)
    );

    if (!hasValidExtension) {
      return { 
        valid: false, 
        error: 'Неподдерживаемый формат файла. Используйте .docx или .doc' 
      };
    }

    return { valid: true };
  }

  /**
   * Полный процесс загрузки и парсинга документа
   */
  async loadAndParseDocument() {
    try {
      // Выбираем документ
      const pickResult = await this.pickDocument();
      if (!pickResult.success) {
        return pickResult;
      }

      // Валидируем документ
      const validation = this.validateDocument(pickResult);
      if (!validation.valid) {
        return {
          success: false,
          error: validation.error,
        };
      }

      // Парсим документ
      const parseResult = await this.parseWordDocument(pickResult.uri);
      
      return {
        ...parseResult,
        documentName: pickResult.name,
        documentSize: pickResult.size,
      };
    } catch (error) {
      console.error('Error in loadAndParseDocument:', error);
      return {
        success: false,
        error: error.message,
        cards: [],
        count: 0,
      };
    }
  }

  /**
   * Создает пример Word-документа для тестирования
   */
  createSampleDocument() {
    const sampleCards = [
      'Начните свой день с благодарности за то, что у вас есть.',
      'Помните: каждый эксперт когда-то был новичком.',
      'Не бойтесь совершать ошибки - они ведут к росту.',
      'Инвестируйте в себя - это лучшая инвестиция, которую вы можете сделать.',
      'Читайте книги успешных людей и применяйте их советы.',
      'Окружите себя людьми, которые вдохновляют вас на рост.',
      'Ставьте цели, которые заставляют вас выйти из зоны комфорта.',
      'Помните: успех - это сумма небольших усилий, повторяемых изо дня в день.',
    ];

    return sampleCards.join('\n\n');
  }
}

export default new WordParser();
