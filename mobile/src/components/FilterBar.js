import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { theme } from '../theme/theme';

export function FilterBar({ filter, onFilterChange }) {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.filterButton,
          filter === 'all' && styles.activeFilter,
        ]}
        onPress={() => onFilterChange('all')}
      >
        <Text
          style={[
            styles.filterText,
            filter === 'all' && styles.activeFilterText,
          ]}
        >
          Все
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[
          styles.filterButton,
          filter === 'favorites' && styles.activeFilter,
        ]}
        onPress={() => onFilterChange('favorites')}
      >
        <Text
          style={[
            styles.filterText,
            filter === 'favorites' && styles.activeFilterText,
          ]}
        >
          Избранное
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    marginHorizontal: 20,
    marginTop: 10,
    borderRadius: 12,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeFilter: {
    backgroundColor: theme.colors.primary,
  },
  filterText: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text,
  },
  activeFilterText: {
    color: 'white',
  },
});
