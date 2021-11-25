import { StatusBar } from 'expo-status-bar';
import React, { Component } from 'react';
import { Modal, SafeAreaView, StyleSheet, Text, TouchableOpacity, View, Button, Image, Switch } from 'react-native';
import  AsyncStorage  from "@react-native-async-storage/async-storage";

import styled, { ThemeProvider } from 'styled-components/native'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { switchTheme } from '../redux/actions'
import { darkTheme, lightTheme, defaultTheme, redTheme } from '../styles/theme'

class SettingsScreen extends Component{
    constructor(props){
        super(props);

        this.state = {
            isTimerDisabled: false,

            currentTheme: '#007fff',
            themeModalVisible: false,
            defaultThemeBorder: '#007fff',
            darkThemeBorder: '#000000',
            lightThemeBorder: '#FFFFFF',
            redThemeBorder: '#750000',

            picker: null,
        };

    }

    _loadToggles = async () => {
        const value = await AsyncStorage.getItem("isTimerDisabled");
        if (value == "true") { this.setState({ isTimerDisabled: true }); }
    }

    getTheme = async () => {
        var theme = await AsyncStorage.getItem("theme");
        if(theme == null){
            theme = 'default'
        }
        
        switch(theme) {
            case 'dark':
              this.setState({currentTheme: '#000000', darkThemeBorder: 'red'});
              break;
            case 'light':
                this.setState({currentTheme: '#FFFFFF', lightThemeBorder: 'red'});
              break;
            case 'red':
                this.setState({currentTheme: '#750000', redThemeBorder: 'red'});
              break;
            default:
                this.setState({currentTheme: '#007fff', defaultThemeBorder: 'red'});
        }
    }

    switchTheme = async (theme) => {
        this.setState({darkThemeBorder: '#000000', lightThemeBorder: '#FFFFFF', defaultThemeBorder: '#007fff', redThemeBorder: '#750000'});
        switch(theme) {
            case 'dark':
              this.props.switchTheme(darkTheme);
              this.setState({currentTheme: '#000000', darkThemeBorder: 'red'});
              this.storeData('theme', 'dark');
              break;
            case 'light':
                this.props.switchTheme(lightTheme);
                this.setState({currentTheme: '#FFFFFF', lightThemeBorder: 'red',});
                this.storeData('theme', 'light');
              break;
            case 'red':
                this.props.switchTheme(redTheme);
                this.setState({currentTheme: '#750000', redThemeBorder: 'red'});
                this.storeData('theme', 'red');
              break;
            default:
                this.props.switchTheme(defaultTheme);
                this.setState({currentTheme: '#007fff', defaultThemeBorder: 'red'});
                this.storeData('theme', 'default');
        }
        this.setThemeModalVisible(false);
    }

    componentDidMount(){
        this._loadToggles();

        this.getTheme();
    }

    toggleTimerDisableSwitch = () => {
        if (this.state.isTimerDisabled)
        {
            this.setState({isTimerDisabled: false});
            this.storeData("isTimerDisabled", "false")
        }
        else
        {
            this.setState({isTimerDisabled: true})
            this.storeData("isTimerDisabled", "true")
        }
    }

    storeData = async (key, value) => {
        try {
            await AsyncStorage.setItem(key, value);
        } 
        catch (error) {
            console.warn(error);
        }
    }
    
    checkToggles = async () =>{
        try {
            const value = await AsyncStorage.getItem("isTimerDisabled");
            if (value == "true"){
                this.setState ({
                    isTimerDisabled: true,
                })
            }
        } 
        catch (error) {
            console.warn(error)
        }
    }

    setBackgroundModalVisible = (visible, index) => {
        this.setState({ backgroundModalVisible: visible });
    }

    onBackgroundColorChange = (newColor) =>{
        this.setState({backgroundColor: newColor});
    }

    setThemeModalVisible = (visible, index) => {
        this.setState({ themeModalVisible: visible });
    }

    onAccentColorChange = (newColor) =>{
        this.setState({accentColor: newColor});
    }

    render(){
        const { navigate } = this.props.navigation;
        const { themeModalVisible } = this.state;
        return (
            <ThemeProvider theme={this.props.theme}>
                <Container>
                    <StatusBar style="auto" />

                    <Modal
                    animationType="slide"
                    transparent={true}
                    visible={themeModalVisible}
                    onRequestClose={() => {
                        this.setThemeModalVisible(!themeModalVisible);
                    }}
                    >
                        <TouchableOpacity activeOpacity={1} onPress={() => this.setThemeModalVisible(!themeModalVisible)} style={{flex: 1,justifyContent: 'center',alignItems: 'center'}}>
                        <TouchableOpacity activeOpacity={1} style={{width: '60%', height: '20%'}}>
                            <ModalView>
                                <View style={styles.themes}>
                                    <TouchableOpacity activeOpacity={1} style={styles.theme} onPress={() => this.switchTheme('default')}>
                                        <View style={{backgroundColor: "#007fff", width: 50, height: 30, borderWidth: 2, borderColor: this.state.defaultThemeBorder}}></View>
                                        <ModalText>Default</ModalText>
                                    </TouchableOpacity>
                                    <TouchableOpacity activeOpacity={1} style={styles.theme} onPress={() => this.switchTheme('dark')}>
                                        <View style={{backgroundColor: '#000000', width: 50, height: 30, borderWidth: 2, borderColor: this.state.darkThemeBorder}}></View>
                                        <ModalText>Dark</ModalText>
                                    </TouchableOpacity>
                                    <TouchableOpacity activeOpacity={1} style={styles.theme} onPress={() => this.switchTheme('light')}>
                                        <View style={{backgroundColor: '#FFFFFF', width: 50, height: 30, borderWidth: 2, borderColor: this.state.lightThemeBorder}}></View>
                                        <ModalText>Light</ModalText>
                                    </TouchableOpacity>
                                    <TouchableOpacity activeOpacity={1} style={styles.theme} onPress={() => this.switchTheme('red')}>
                                        <View style={{backgroundColor: '#750000', width: 50, height: 30, borderWidth: 2, borderColor: this.state.redThemeBorder}}></View>
                                        <ModalText>Red</ModalText>
                                    </TouchableOpacity>
                                </View>

                            </ModalView>
                        </TouchableOpacity>
                        </TouchableOpacity>
                    </Modal>

                    <View style={styles.settings}>
                        <View style={styles.settingWrapper}>
                            <Text style={styles.settingText}>
                                Disable Timer during Solve
                            </Text>
                            <Switch style={styles.switch} 
                                trackColor={{ false: "black", true: "lime" }}
                                thumbColor={this.state.isTimerDisabled ? "green" : "red"}
                                ios_backgroundColor="#3e3e3e"
                                onValueChange={this.toggleTimerDisableSwitch}
                                value={this.state.isTimerDisabled}
                            />
                        </View>

                        <View style={styles.settingWrapper}>
                            <Text style={styles.settingText}>
                                Change Theme
                            </Text>
                            <TouchableOpacity activeOpacity={1} onPress={() => this.setThemeModalVisible(true)}>
                                <View style={{backgroundColor: this.state.currentTheme, width: 50, height: 30, borderWidth: 2, borderColor: 'black'}}></View>
                            </TouchableOpacity>
                        </View>
                    </View>


                    <PageNavigator>
                        <TouchableOpacity>
                            <Image style={styles.pagesButtonClicked} source={require('../assets/settings.png')}/>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => this.props.navigation.navigate('HomeScreen')}>
                            <Image style={styles.pagesButton} source={require('../assets/home.png')}/>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => this.props.navigation.navigate('SolvesScreen')}>
                            <Image style={styles.pagesButton} source={require('../assets/graph.png')}/>
                        </TouchableOpacity>
                    </PageNavigator>
                </Container>
            </ThemeProvider>
            
            )
    }
}

const styles = StyleSheet.create({
    pagesButton: {
        width: 25,
        height: 25,
    },
    pagesButtonClicked: {
        width: 35,
        height: 35,
    },
    settings: {
        top: '5%',
        margin: 10,
    },
    settingWrapper: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 15,
        borderRadius: 60,
        width: 350,
        backgroundColor: '#696969',
        margin: 10,
        height: 60,
    },
    backgroundColorSquare: {
        width: 50, 
        height: 25,
        borderColor: 'black',
        borderWidth: 1,
    },
    accentColorSquare: {
        width: 50, 
        height: 25,
        borderColor: 'black',
        borderWidth: 1,
    },
    whiteText:{
        color: '#FFFFFF'
    },
    theme: {
        alignItems: 'center',
        margin: 5,
    },
    themes:{
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
});

const Container = styled.SafeAreaView`
  flex: 1;
  background-color: ${props => props.theme.PRIMARY_BACKGROUND_COLOR};
  justify-content: space-between;
  align-items: center;
  width: 100%;
`

const PageNavigator = styled.View`
    position: absolute;
    bottom: 50px;
    flex-direction: row;
    justify-content: space-around;
    align-items: center;
    padding-vertical: 15px;
    padding-horizontal: 15px;
    border-radius: 60px;
    width: 250px;
    backgroundColor: ${props => props.theme.SECONDARY_BACKGROUND_COLOR};
`
const ModalView = styled.View`
    flex: 1;
    backgroundColor: ${props => props.theme.PRIMARY_BACKGROUND_COLOR};
    borderRadius: 20px;
    padding: 35px;
    alignItems: center;
    justifyContent: space-around;
    shadowColor: #000;
    shadowOpacity: 0.25;
    shadowRadius: 4px;
    elevation: 5;
`
const ModalText = styled.Text`
    color: ${props => props.theme.PRIMARY_TEXT_COLOR};
`

const mapStateToProps = state => ({
    theme: state.themeReducer.theme
  })
  
const mapDispatchToProps = dispatch => ({
    switchTheme: bindActionCreators(switchTheme, dispatch)
})

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(SettingsScreen)