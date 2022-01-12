import { StatusBar } from 'expo-status-bar';
import React, { Component } from 'react';
import { Modal, SafeAreaView, StyleSheet, Text, TouchableOpacity, View, Button, Image, Switch } from 'react-native';
import  AsyncStorage  from "@react-native-async-storage/async-storage";
import {Picker} from '@react-native-picker/picker';
import BannerAd from "../Ads/BannerAdSettings";


import styled, { ThemeProvider } from 'styled-components/native'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { switchTheme } from '../redux/actions'
import { darkTheme, lightTheme, defaultTheme, redTheme, avocadoTheme, cottonCandyTheme } from '../styles/theme'

import { MyContext } from "../context";

class SettingsScreen extends Component{
    static contextType = MyContext;
    constructor(props){
        super(props);

        this.state = {
            isTimerDisabled: false,

            currentTheme: 'default',
            themes: ['default', 'dark', 'light', 'red', 'avocado', 'cotton candy' ],

            picker: null,
            tipModalVisible: false,
        };

    }

    _loadToggles = async () => {
        const isTimerDisabled = await AsyncStorage.getItem("isTimerDisabled");
        if (isTimerDisabled == "true") { this.setState({ isTimerDisabled: true }); }

        const inspection = await AsyncStorage.getItem("inspection");
        if (inspection == "true"){this.context.setInspection(true);}
    }

    getTheme = async () => {
        var theme = await AsyncStorage.getItem("theme");
        if(theme == null){
            theme = 'default'
        }
        
        switch(theme) {
            case 'dark':
              this.setState({currentTheme: 'dark'});
              break;
            case 'light':
                this.setState({currentTheme: 'light'});
              break;
            case 'red':
                this.setState({currentTheme: 'red'});
              break;
            case 'avocado':
                this.setState({currentTheme: 'avocado'});
              break;
            case 'cotton candy':
                this.setState({currentTheme: 'cotton candy'});
              break;
            default:
                this.setState({currentTheme: 'default'});
        }
    }

    switchTheme = async (itemValue, itemIndex) => {
        switch(itemValue) {
            case 'dark':
              this.props.switchTheme(darkTheme);
              this.setState({currentTheme: 'dark'});
              this.storeData('theme', 'dark');
              break;
            case 'light':
                this.props.switchTheme(lightTheme);
                this.setState({currentTheme: 'light'});
                this.storeData('theme', 'light');
              break;
            case 'red':
                this.props.switchTheme(redTheme);
                this.setState({currentTheme: 'red'});
                this.storeData('theme', 'red');
              break;
            case 'avocado':
                this.props.switchTheme(avocadoTheme);
                this.setState({currentTheme: 'avocado'});
                this.storeData('theme', 'avocado');
              break;
            case 'cotton candy':
                this.props.switchTheme(cottonCandyTheme);
                this.setState({currentTheme: 'cotton candy'});
                this.storeData('theme', 'cotton candy');
              break;
            default:
                this.props.switchTheme(defaultTheme);
                this.setState({currentTheme: 'default'});
                this.storeData('theme', 'default');
        }
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

    toggleInspectionSwitch = () => {
        if (this.context.inspection)
        {
            this.context.setInspection(false);
            this.storeData("inspection", "false");
        }
        else
        {
            this.context.setInspection(true);
            this.storeData("inspection", "true");
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


    onBackgroundColorChange = (newColor) =>{
        this.setState({backgroundColor: newColor});
    }

    setTipModalVisible = (visible, index) => {
        this.setState({ tipModalVisible: visible });
    }

    onAccentColorChange = (newColor) =>{
        this.setState({accentColor: newColor});
    }

    render(){
        const { navigate } = this.props.navigation;
        const { tipModalVisible } = this.state;

        let themes = this.state.themes.map( (s, i) => {
            return <Picker.Item  key={i} value={this.state.themes[i]} label={this.state.themes[i]} />
        });
        
        return (
            <MyContext.Consumer>
                {context => (
                    <ThemeProvider theme={this.props.theme}>
                    <Container>
                    <View>
                        {context.showAds == true && context.isPro == false? <BannerAd/> : null}
                    </View>
                        <Modal
                        animationType="slide"
                        transparent={true}
                        visible={tipModalVisible}
                        onRequestClose={() => {
                            this.setModalVisible(!tipModalVisible);
                        }}
                        >
                            <TouchableOpacity activeOpacity={1} onPress={() => this.setTipModalVisible(!tipModalVisible)} style={{flex: 1,justifyContent: 'center',alignItems: 'center'}}>
                            <TouchableOpacity activeOpacity={1} style={{width: 375, height: 250}}>
                            <View style={styles.centeredView}>
                                <ModalView>
                                    <ModalTitle>Buy me a Coffee</ModalTitle>
                                    <View style={{flexDirection: 'row'}}>
                                        <Tips><TipText>$1.00</TipText></Tips>
                                        <Tips><TipText>$2.00</TipText></Tips>
                                    </View>
                                    <View style={{flexDirection: 'row'}}>
                                        <Tips><TipText>$5.00</TipText></Tips>
                                        <Tips><TipText>$10.00</TipText></Tips>
                                    </View>
                                    
                                </ModalView>
                            </View>
                            </TouchableOpacity>
                            </TouchableOpacity>
                        </Modal>
                        <StatusBar style="auto" />
                        <View style={styles.settings}>
                            <SettingWrapper>
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
                            </SettingWrapper>

                            <SettingWrapper>
                                <Text style={styles.settingText}>
                                    Inspection
                                </Text>
                                <Switch style={styles.switch} 
                                    trackColor={{ false: "black", true: "lime" }}
                                    thumbColor={context.inspection ? "green" : "red"}
                                    ios_backgroundColor="#3e3e3e"
                                    onValueChange={this.toggleInspectionSwitch}
                                    value={context.inspection}
                                />
                            </SettingWrapper>
    
                            <SettingWrapper>
                                <Text style={styles.settingText}>
                                    Change Theme
                                </Text>
                                <ThemeSelector
                                    itemStyle={{height: 50}}
                                        selectedValue={this.state.currentTheme}
                                        onValueChange={(itemValue, itemIndex) => this.switchTheme(itemValue, itemIndex)}
    
                                    >
                                        {themes}
                                </ThemeSelector>
                            </SettingWrapper>
                            
                            {/* <TouchableOpacity activeOpacity={1} onPress={() => this.setTipModalVisible(!tipModalVisible)} >
                                <SettingWrapper>
                                    <Text style={styles.settingText}>
                                        Buy me a Coffee
                                    </Text>
                                </SettingWrapper>
                            </TouchableOpacity> */}
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
                )}
            </MyContext.Consumer>
            )
    }
}

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    pagesButton: {
        width: 25,
        height: 25,
    },
    pagesButtonClicked: {
        width: 35,
        height: 35,
    },
    settings: {
        margin: 10,
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
        flexWrap: 'wrap',
    },
});

const Container = styled.SafeAreaView`
  flex: 1;
  background-color: ${props => props.theme.PRIMARY_BACKGROUND_COLOR};
  align-items: center;
  width: 100%;
`
const Tips = styled.TouchableOpacity`
    align-items: center;
    justify-content: center;
    background-color: ${props => props.theme.SECONDARY_BACKGROUND_COLOR};
    width: 80px;
    padding: 10px;
    borderRadius: 60px;
    margin: 10px;
`
const TipText = styled.Text`
    color: ${props => props.theme.SECONDARY_TEXT_COLOR};
`
const PageNavigator = styled.View`
    position: absolute;
    bottom: 3%;
    flex-direction: row;
    justify-content: space-around;
    align-items: center;
    padding-vertical: 15px;
    padding-horizontal: 15px;
    border-radius: 60px;
    width: 60%;
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
    text-align: center;
`
const ModalTitle = styled.Text`
    color: ${props => props.theme.PRIMARY_TEXT_COLOR};
    text-align: center;
    fontSize: 20px;
    fontWeight: bold;
`
const ThemeSelector = styled.Picker`
    backgroundColor: ${props => props.theme.SECONDARY_BACKGROUND_COLOR};
    borderRadius: 10px;
    width: 150px;
`
const SettingWrapper = styled.View`
    flexDirection: row;
    justifyContent: space-between;
    alignItems: center;
    paddingVertical: 15px;
    paddingHorizontal: 15px;
    borderRadius: 60px;
    minWidth: 60%;
    backgroundColor: ${props => props.theme.SECONDARY_BACKGROUND_COLOR};
    margin: 10px;
    height: 60px;
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