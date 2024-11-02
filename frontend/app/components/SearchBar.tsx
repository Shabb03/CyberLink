import React from 'react';
import { View, TextInput, StyleSheet, Dimensions } from 'react-native';
import themeColors from '../colors/colors';

const screenWidth = Dimensions.get('window').width;

const SearchBar = ({ onSearch }: { onSearch: (text: string) => void }) => {
  const handleSearch = (text: string) => {
    onSearch(text);
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Search..."
        placeholderTextColor={themeColors.yellow}
        onChangeText={handleSearch}
        clearButtonMode="while-editing"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: screenWidth,
    padding: 10,
    alignItems: 'center',
  },
  input: {
    height: 40,
    width: '95%',
    borderColor: themeColors.textPrimary,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    fontSize: 16,
    backgroundColor: themeColors.inputbg,
    color: themeColors.yellow,
    shadowColor: themeColors.textPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 10,
  },
});

export default SearchBar;