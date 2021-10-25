import { StatusBar } from 'expo-status-bar';
import React, { Component } from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View, Button, Image } from 'react-native';

export default class SettingsScreen extends Component{

    state = {
        
    }

    render(){
        const { navigate } = this.props.navigation;
        return (
            <SafeAreaView style={styles.container}>
                <StatusBar style="auto" />
                <View style={styles.pageNavigator}>
                    <TouchableOpacity onPress={() => this.props.navigation.navigate('SettingsScreen')}>
                        <Image style={styles.pagesButton} source={require('../assets/settings.png')}/>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => this.props.navigation.navigate('HomeScreen')}>
                        <Image style={styles.pagesButton} source={require('../assets/home.png')}/>
                    </TouchableOpacity>
                    <TouchableOpacity>
                    <Image style={styles.pagesButton} source={require('../assets/graph.png')}/>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
            )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'gray',
        alignItems: 'center',
    },
    pageNavigator: {
        position: 'absolute',
        bottom: 50,
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 15,
        borderRadius: 60,
        width: 250,
        backgroundColor: 'dodgerblue' 
    },
    pagesButton: {
        width: 25,
        height: 25,
    },
});