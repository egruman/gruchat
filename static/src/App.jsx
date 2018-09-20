import React, { Component } from 'react';
import Beforeunload from 'react-beforeunload';
import localStorage from 'local-storage';

function Cond(props){
	var display = props.children;
	if(!props.iff) display="";
	return display;
}

class LoginForm extends Component{
	constructor(props){
		super(props);
		this.state={
			value: ""
		};
		this.handleChange=this.handleChange.bind(this);
		this.resetText=this.resetText.bind(this);
	}

	handleChange(event){
		this.setState({
			value: event.target.value
		});
	}

	resetText(event){
		if(this.props.loggedIn)
			this.setState({
				value: this.props.user
			});
	}

	render(){
		return (<form onSubmit={event => this.props.login(event, this.state.value)}> <label> Username: 
			<input type="text" value={this.state.value} name="username" onBlur={this.resetText}
					onChange={this.handleChange} placeholder="your username"/> 
			</label>
			</form>);
	}
}

class UserPicker extends Component{
	constructor(props){
		super(props);
		this.state={};
		this.handleChange=this.handleChange.bind(this);
	}

	handleChange(event){
		event.preventDefault();
		var friend = this.props.users[event.target.value-1];
		this.props.chooseUser(friend,true);
	}

	render(){
		return (<div> 
			<label>Start a Conversation: 
			<select name="user" value={0} onChange={this.handleChange}>
  			{["Select a User..."].concat(this.props.users).map((name,index) => 
  				<option key={name} value={index} >
  				{Cond({children : String(index)+".", iff: index>0})} {name}</option>)}
 			</select></label></div>);
	}
}

class ChatModule extends Component{
	constructor(props){
		super(props);
		this.state={
			value: ""
		};
		this.handleChange=this.handleChange.bind(this);
		this.handleSend=this.handleSend.bind(this);
	}

	handleChange(event){
		this.setState({
			value: event.target.value
		});
	}

	handleSend(event){
		event.preventDefault();
		var message=this.state.value;
		if(message=="") return;
		this.props.sendMessage(message, this.props.user);
		this.setState({
			value: ""
		});
	}

	componentDidMount(){
		if(this.props.textref[1])
	    	this.props.textref[0].current.focus();
	}

	render(){
		var display="";
		if(this.props.chat) display=this.props.chat;
		if(this.props.pending){
			for(var i in this.props.pending){
				var msg= this.props.pending[i];
				if(display=="") display= msg;
				else display+= "\n"+msg;
			}
		}
		return (<div><h3>{this.props.user} 
				<button onClick={(event)=>this.props.closeChat(this.props.user)}> X </button></h3>
					<textarea readOnly={true} cols={36} rows={16} value={display}/>
					<br/>
					<form onSubmit={this.handleSend}>
						<input type="text" value={this.state.value} name="message" ref={this.props.textref[0]}
							onChange={this.handleChange} placeholder="your message"/> 
					</form>
				</div>);
	}
}

class Notification extends Component{
	constructor(props) {
    super(props);
    this.state = {
    	timer: props.lifetime,
    	timerID: null,
    	ID: String(props.timestamp)+"~~"+String(props.note)
    };
    this.tick=this.tick.bind(this);
  }

  tick(){
  	this.setState(function(prev){
  		return {timer: prev.timer-1};
  	});
  	if(this.state.timer<=0)
  		this.props.end(this.state.ID);
  }

  componentWillUnmount(){
  	clearInterval(this.state.timerID);
  }

  componentDidMount(){
  	this.setState({timerID: setInterval(this.tick, 1)});
  }

  render(){
  	return <div> {this.props.note}
  		<button onClick={(event)=>this.props.end(this.state.ID)}> 
  		X </button></div>;
  }
}

class App extends Component{
	constructor(props){
		super(props);
		this.state={
			chats: {},
			outBox: {},
			myName: "",
			activeUsers: [],
			openChats: [],
			loggedIn: false,
			notifs: [],
			refs: {},
			tabs: {}
		};
		this.login=this.login.bind(this);
		this.addNewUser=this.addNewUser.bind(this);
		this.addCurrUser=this.addCurrUser.bind(this);
		this.chooseUser=this.chooseUser.bind(this);
		this.closeChat=this.closeChat.bind(this);
		this.sendMessage=this.sendMessage.bind(this);
		this.updateMessages=this.updateMessages.bind(this);
		this.logout=this.logout.bind(this);
		this.rmvUser=this.rmvUser.bind(this);
		this.rmvNotif=this.rmvNotif.bind(this);
	}

	componentDidMount(){
		this.props.socket.on('login response', this.addNewUser);
		this.props.socket.on('welcome response', this.addCurrUser);
		this.props.socket.on('recieve message', this.updateMessages);
		this.props.socket.on('logout response', this.rmvUser);
	}

	addCurrUser(msg){
		if(msg.to != this.state.myName || !this.state.loggedIn) return;
		this.setState(function(prev){
			if(!(msg.from in prev.tabs)){
				prev.activeUsers.push(msg.from);
				prev.tabs[msg.from]=1;
				if(msg.chat) prev.chats[msg.from]=msg.chat;
			} else prev.tabs[msg.from]+=1;
			return {activeUsers: prev.activeUsers, chats: prev.chats, tabs: prev.tabs};
		});
	}

	rmvUser(msg){
		var olduser = msg.username;
		if(olduser == this.state.myName || !this.state.loggedIn) return;
		this.setState(function(prev){
			prev.tabs[olduser]-=1;
			if(prev.tabs[olduser]==0){
				var index = prev.activeUsers.indexOf(olduser);
				delete prev.tabs[olduser];
				prev.activeUsers.splice(index,1);
				prev.notifs.push([olduser+ " has logged out", 700, new Date()]);
				return {activeUsers: prev.activeUsers, tabs: prev.tabs, notifs: prev.notifs};
			} else return {tabs: prev.tabs};
		});
		if((olduser in this.state.refs) && !(olduser in this.state.tabs))
			this.closeChat(olduser);
	}

	updateMessages(msg){
		var user=this.state.myName;
		var ab = [msg.from, msg.to].sort();
		var key= String(ab[0].length)+","+String(ab[1].length)+"|"+ab[0]+","+ab[1];

		if((msg.to != user  && msg.from != user) || !this.state.loggedIn) return;
		if(msg.to == user) this.chooseUser(msg.from, false);
		if(msg.from == user) this.chooseUser(msg.to, true);
		this.setState(function(prev){
			if(user==msg.to){
				if(msg.from in prev.chats)
					prev.chats[msg.from]+= "\n"+msg.from+": "+msg.message;
				else prev.chats[msg.from]= msg.from+": "+msg.message;

				localStorage.set(key, {chat : this.state.chats[msg.from]});
			} else {
				var outIndex= prev.outBox[msg.to].indexOf(user+" (sending): "+msg.message);
				if(outIndex>-1) prev.outBox[msg.to].splice(outIndex,1);
				if(msg.to in prev.chats)
					prev.chats[msg.to]+= "\n"+user+": "+msg.message;
				else prev.chats[msg.to]= user+": "+msg.message;

				localStorage.set(key, {chat : this.state.chats[msg.to]});
			}
			return {chats: prev.chats, outBox: prev.outBox};
		});

	}

	addNewUser(msg){
		var app=this;
		var newuser = msg.username, name = app.state.myName;
		var ab = [newuser, name].sort();
		var key= String(ab[0].length)+","+String(ab[1].length)+"|"+ab[0]+","+ab[1];

		if(newuser == name){
			app.setState(function(prev){
				if(prev.loggedIn){
					prev.notifs.push(["You have logged in on another tab", 700, new Date()]);
					return {notifs: prev.notifs};
				}
				return {loggedIn: true};
			});
		} else if(app.state.loggedIn) {
			app.setState(function(prev){
				if(!(newuser in prev.tabs)){
					var backup = localStorage.get(key);
					if(backup) prev.chats[newuser]=backup.chat;
					prev.tabs[newuser]=1;
					prev.activeUsers.push(newuser);
					prev.notifs.push([newuser+ " has logged in", 700, new Date()]);
				} else prev.tabs[newuser]+=1;
				return {activeUsers: prev.activeUsers,
					notifs: prev.notifs, tabs: prev.tabs};
			});
			app.props.socket.emit('welcome', 
				{to: newuser, from: name, chat: app.state.chats[newuser]});
		}
	}

	chooseUser(friend, mine){
		this.setState(function(prev){
			if(prev.openChats.indexOf(friend)==-1){
				prev.refs[friend]=[React.createRef(),mine];
				prev.openChats.push(friend);
			} else if(mine){
				prev.refs[friend][0].current.focus();
			}
			return {openChats: prev.openChats, refs: prev.refs};
		});
	}

	closeChat(name){
		this.setState(function(prev){
			var index = prev.openChats.indexOf(name);
			prev.openChats.splice(index,1);
			delete prev.refs[name];
			return {openChats: prev.openChats, refs: prev.refs};
		});
	}

	logout(event){
		if(!this.state.loggedIn) return;
		var user=this.state.myName;
		this.setState({
			chats: {},
			outBox: {},
			activeUsers: [],
			openChats: [],
			loggedIn: false,
			notifs: [],
			refs: {},
			tabs: {}
		});
		this.props.socket.emit('logout', {username: user});
	}

	login(event, username){
		event.preventDefault();
		var curruser=this.state.myName;
		if(curruser!=username){
			this.setState({myName: username});
			this.logout(event);
			if(username!="")
				this.props.socket.emit('login', {username: username});
		}
	}

	sendMessage(message, recipient){
		var user=this.state.myName;
		this.setState(function(prev){
			if(recipient in prev.outBox)
				prev.outBox[recipient].push(user+" (sending): "+ message);
			else
				prev.outBox[recipient]= [user+" (sending): "+ message];
			return {outBox: prev.outBox};
		});
		this.props.socket.emit('send message', {to: recipient, from: user, message: message});
	}

	rmvNotif(noteID){
		this.setState(function(prev){
			var index = prev.notifs.map(a=>(String(a[2])+"~~"+String(a[0]))).indexOf(noteID);
			prev.notifs.splice(index,1);
			return {notifs: prev.notifs};
		});
	}

	render(){
		var user=this.state.myName;
		return (<Beforeunload onBeforeunload={this.logout}><div>
					<Cond iff={this.state.loggedIn}><h2> Welcome, {user}!</h2></Cond>
					<LoginForm login={this.login} user={user} loggedIn={this.state.loggedIn}/>
					<Cond iff={this.state.loggedIn}>
						<UserPicker users={this.state.activeUsers} chooseUser={this.chooseUser}/>
					</Cond>
					<div>
						{this.state.notifs.map(note => 
							<Notification key={String(note[2])+"~~"+String(note[0])} timestamp={note[2]} note={note[0]}
								lifetime={note[1]} end={this.rmvNotif}/>)}
					</div>
					<Cond iff={this.state.loggedIn}>
						{this.state.openChats.map((name) => 
							<ChatModule key={name} user={name} chat={this.state.chats[name]}
								textref={this.state.refs[name]} closeChat={this.closeChat}
								sendMessage={this.sendMessage} pending={this.state.outBox[name]}/>)}
					</Cond>

				</div></Beforeunload>);
	}
}


export default App;
