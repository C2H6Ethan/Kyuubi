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
import CardStackStyleInterpolator from "react-navigation/src/views/StackView/StackViewStyleInterpolator";


const screens = {
  HomeScreen: {
    screen: HomeScreen,
      navigationOptions: {
        header: null,
        cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS
      },
  },
  SettingsScreen: {
    screen: SettingsScreen,
      navigationOptions: {
        header: null,
        cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS
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
