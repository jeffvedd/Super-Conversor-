import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  SafeAreaView, 
  StatusBar, 
  Modal, 
  FlatList, 
  Clipboard,
  Animated,
  Easing
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const App = () => {
  const [inputValue, setInputValue] = useState('');
  const [fromUnit, setFromUnit] = useState('kg');
  const [toUnit, setToUnit] = useState('lb');
  const [result, setResult] = useState('');
  const [activeCategory, setActiveCategory] = useState('weight');
  const [showFromUnitModal, setShowFromUnitModal] = useState(false);
  const [showToUnitModal, setShowToUnitModal] = useState(false);
  const [copyStatus, setCopyStatus] = useState('');

  // ✅ Animação para feedback suave
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const categories = {
    weight: { name: 'Peso', units: { 'kg': 'Quilogramas', 'g': 'Gramas', 'lb': 'Libras', 'oz': 'Onças' } },
    length: { name: 'Comprimento', units: { 'm': 'Metros', 'cm': 'Centímetros', 'km': 'Quilômetros', 'ft': 'Pés', 'in': 'Polegadas' } },
    volume: { name: 'Volume', units: { 'l': 'Litros', 'ml': 'Mililitros', 'gal': 'Galões', 'cup': 'Xícaras' } },
    temperature: { name: 'Temperatura', units: { 'c': 'Celsius', 'f': 'Fahrenheit', 'k': 'Kelvin' } }
  };

  useEffect(() => {
    const units = Object.keys(categories[activeCategory].units);
    setFromUnit(units[0]);
    setToUnit(units[1] || units[0]);
    setResult('');
    setInputValue('');
  }, [activeCategory]);

  const convert = () => {
    if (!inputValue) return;
    const value = parseFloat(inputValue);  
    if (isNaN(value)) { setResult('Valor inválido'); return; }  

    let convertedValue;  
    if (activeCategory === 'weight') {  
      const weightInKg = { 'kg': value, 'g': value / 1000, 'lb': value / 0.453592, 'oz': value / 0.0283495 }[fromUnit];  
      convertedValue = { 'kg': weightInKg, 'g': weightInKg * 1000, 'lb': weightInKg * 0.453592, 'oz': weightInKg * 0.0283495 }[toUnit];  
    } else if (activeCategory === 'length') {  
      const lengthInMeters = { 'm': value, 'cm': value / 100, 'km': value * 1000, 'ft': value / 3.28084, 'in': value / 39.3701 }[fromUnit];  
      convertedValue = { 'm': lengthInMeters, 'cm': lengthInMeters * 100, 'km': lengthInMeters / 1000, 'ft': lengthInMeters * 3.28084, 'in': lengthInMeters * 39.3701 }[toUnit];  
    } else if (activeCategory === 'volume') {  
      const volumeInLiters = { 'l': value, 'ml': value / 1000, 'gal': value * 3.78541, 'cup': value * 0.24 }[fromUnit];  
      convertedValue = { 'l': volumeInLiters, 'ml': volumeInLiters * 1000, 'gal': volumeInLiters / 3.78541, 'cup': volumeInLiters / 0.24 }[toUnit];  
    } else if (activeCategory === 'temperature') {  
      let tempInCelsius = fromUnit === 'c' ? value : fromUnit === 'f' ? (value - 32) * (5/9) : value - 273.15;
      convertedValue = toUnit === 'c' ? tempInCelsius : toUnit === 'f' ? (tempInCelsius * 9/5) + 32 : tempInCelsius + 273.15;
    }  
    setResult(convertedValue ? convertedValue.toFixed(4) : '0.0000');
  };

  const swapUnits = () => {
    const temp = fromUnit;
    setFromUnit(toUnit);
    setToUnit(temp);
    if (result && !isNaN(parseFloat(result))) {
      setInputValue(result);
      setResult(inputValue);
    }
  };

  const selectFromUnit = (unit) => { setFromUnit(unit); setShowFromUnitModal(false); setResult(''); };
  const selectToUnit = (unit) => { setToUnit(unit); setShowToUnitModal(false); setResult(''); };
  const changeCategory = (category) => setActiveCategory(category);

  // ✅ Função de copiar com animação
  const copyPix = () => {
    Clipboard.setString('03927223999');
    
    // Animação de pulso
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.1,
        duration: 150,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 150,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      })
    ]).start();

    setCopyStatus('copied');
    setTimeout(() => setCopyStatus(''), 2000);
  };

  const UnitModal = ({ visible, onClose, onSelect, units, title }) => (
    <Modal visible={visible} transparent={true} animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Selecionar {title}</Text>
            <TouchableOpacity onPress={onClose}><Ionicons name="close" size={24} color="#666" /></TouchableOpacity>
          </View>
          <FlatList
            data={Object.entries(units)}
            keyExtractor={([key]) => key}
            renderItem={({ item: [key, name] }) => (
              <TouchableOpacity style={styles.modalItem} onPress={() => onSelect(key)}>
                <Text style={styles.modalItemText}>{name}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#6C63FF" />

      {/* Header */}
      <View style={styles.header}>  
        <Text style={styles.headerTitle}>Conversor Universal</Text>  
        <View style={styles.categoryHeaderRow}>  
          {Object.entries(categories).map(([key, category]) => (  
            <TouchableOpacity key={key} onPress={() => changeCategory(key)}>  
              <Text style={[styles.categoryHeaderText, activeCategory === key && styles.activeCategoryHeaderText]}>  
                {category.name}  
              </Text>  
            </TouchableOpacity>  
          ))}  
        </View>  
      </View>  

      {/* Converter Card */}
      <View style={styles.card}>  
        <View style={styles.inputSection}>  
          <Text style={styles.sectionTitle}>Converter de</Text>  
          <View style={styles.inputContainer}>  
            <TextInput  
              style={styles.input}  
              value={inputValue}  
              onChangeText={setInputValue}  
              placeholder="Digite o valor"  
              keyboardType="numeric"  
              placeholderTextColor="#999"  
            />  
            <TouchableOpacity style={styles.unitSelector} onPress={() => setShowFromUnitModal(true)}>  
              <Text style={styles.unitText}>{categories[activeCategory].units[fromUnit]}</Text>  
            </TouchableOpacity>  
          </View>  
        </View>  

        <TouchableOpacity style={styles.swapButton} onPress={swapUnits}>  
          <Ionicons name="swap-vertical" size={24} color="#6C63FF" />  
        </TouchableOpacity>  

        <View style={styles.outputSection}>  
          <Text style={styles.sectionTitle}>Para</Text>  
          <View style={styles.outputContainer}>  
            <Text style={styles.outputText}>{result || '0.0000'}</Text>  
            <TouchableOpacity style={styles.unitSelector} onPress={() => setShowToUnitModal(true)}>  
              <Text style={styles.unitText}>{categories[activeCategory].units[toUnit]}</Text>  
            </TouchableOpacity>  
          </View>  
        </View>  

        <TouchableOpacity style={styles.convertButton} onPress={convert}>  
          <Text style={styles.convertButtonText}>Converter</Text>  
          <Ionicons name="arrow-forward" size={20} color="white" />  
        </TouchableOpacity>  
      </View>  

      {/* Recent Conversions */}
      <View style={styles.recentContainer}>  
        <Text style={styles.recentTitle}>Conversões Recentes</Text>  
        <View style={styles.recentItem}>  
          <Text style={styles.recentText}>
            {inputValue || '0'} {categories[activeCategory].units[fromUnit]} = {result || '0.0000'} {categories[activeCategory].units[toUnit]}
          </Text>  
          <Text style={styles.recentTime}>Agora mesmo</Text>  
        </View>  
      </View>  

      {/* ✅ Modais */}
      <UnitModal visible={showFromUnitModal} onClose={() => setShowFromUnitModal(false)} onSelect={selectFromUnit} units={categories[activeCategory].units} title="Unidade de Origem" />  
      <UnitModal visible={showToUnitModal} onClose={() => setShowToUnitModal(false)} onSelect={selectToUnit} units={categories[activeCategory].units} title="Unidade de Destino" />  

      {/* ✅ CTA Pix FIXO no rodapé */}
      <Animated.View style={[styles.ctaContainer, { transform: [{ scale: scaleAnim }] }]}>
        <TouchableOpacity style={styles.ctaButton} onPress={copyPix}>
          <Ionicons 
            name={copyStatus === 'copied' ? "checkmark-circle" : "heart"} 
            size={20} 
            color="white" 
          />
          <Text style={styles.ctaButtonText}>
            {copyStatus === 'copied' ? 'Pix copiado! 🙏' : 'Apoie o projeto ❤️'}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
    paddingBottom: 80, // espaço para o CTA não cobrir conteúdo
  },
  header: {
    backgroundColor: '#6C63FF',
    padding: 20,
    paddingTop: 40,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: 'white', textAlign: 'center' },
  categoryHeaderRow: { flexDirection: 'row', justifyContent: 'center', gap: 15, marginTop: 8 },
  categoryHeaderText: { fontSize: 14, color: 'rgba(255,255,255,0.7)', fontWeight: '500' },
  activeCategoryHeaderText: { color: 'white', fontWeight: 'bold', borderBottomWidth: 2, borderBottomColor: 'white', paddingBottom: 2 },
  card: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 20,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 8,
  },
  sectionTitle: { fontSize: 16, color: '#666', marginBottom: 10, fontWeight: '600' },
  inputSection: { marginBottom: 20 },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 15,
    paddingHorizontal: 15,
    paddingVertical: 5,
  },
  input: { flex: 1, fontSize: 20, fontWeight: 'bold', color: '#333', padding: 10 },
  unitSelector: { backgroundColor: '#f0f0f0', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 12 },
  unitText: { fontSize: 14, color: '#666', fontWeight: '600' },
  swapButton: {
    alignSelf: 'center',
    backgroundColor: '#f0f0f0',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  outputSection: { marginBottom: 20 },
  outputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#6C63FF',
    borderRadius: 15,
    paddingHorizontal: 15,
    paddingVertical: 5,
    backgroundColor: 'rgba(108, 99, 255, 0.05)',
  },
  outputText: { flex: 1, fontSize: 20, fontWeight: 'bold', color: '#6C63FF', padding: 10 },
  convertButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#6C63FF',
    padding: 18,
    borderRadius: 15,
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  convertButtonText: { fontSize: 18, fontWeight: 'bold', color: 'white', marginRight: 10 },
  recentContainer: { margin: 20, marginTop: 0 },
  recentTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 15 },
  recentItem: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  recentText: { fontSize: 16, color: '#333', fontWeight: '600' },
  recentTime: { fontSize: 12, color: '#999', marginTop: 5 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContainer: { backgroundColor: 'white', borderTopLeftRadius: 25, borderTopRightRadius: 25, maxHeight: '50%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#eee' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  modalItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#f5f5f5' },
  modalItemText: { fontSize: 16, color: '#333' },

  // ✅ Estilos do CTA fixo
  ctaContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    alignItems: 'center',
    zIndex: 10,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6C63FF', // vermelho do Pix (ou #6C63FF para manter a cor do app)
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 20,
    shadowColor: ' #6C63FF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 10,
    width: '100%',
    justifyContent: 'center',
  },
  ctaButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 8,
  },
});

export default App;
