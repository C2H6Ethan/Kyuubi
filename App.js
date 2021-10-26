import { StatusBar } from 'expo-status-bar';
import React, { Component } from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View, Button, Image } from 'react-native';
import Scrambo from 'scrambo';
import { StackNavigator } from 'react-navigation'
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from 'react-navigation-stack';
import { createAppContainer } from 'react-navigation';
import HomeScreen from './screens/home';
import SettingsScreen from './screens/settings';


const screens = {
  HomeScreen: {
    screen: HomeScreen,
      navigationOptions: {
        headerShown: false,
        animationEnabled: false,
      },
  },
  SettingsScreen: {
    screen: SettingsScreen,
      navigationOptions: {
        headerShown: false,
        animationEnabled: false,
      },
  },
}

const HomeStack = createStackNavigator(screens);
HomeStack.navigationOptions={navigationOptions: {headerShown:false}};
const NavigationApp = createAppContainer(HomeStack);

export default class App extends Component {
  
  render(){
    return <NavigationApp/>;
  }
}
