import { h, render, Component, Fragment, JSX, VNode } from 'preact';

type LegacyProfile = {
	description: string,
	name: string,
	screen_name: string,
	profile_banner_url?: string,
	profile_image_url_https: string,
	followed_by?: boolean,
	protected: boolean,
	user_id_str?: string
};

type MediaEntity = {
	media_url_https: string
};

type TweetInfo = {
	full_text: string,
	favorite_count: string,
	retweet_count: string,
	reply_count: string,
	id_str: string,
	entities?: {
		hashtags: any[],
		symbols: any[],
		user_mentions: any[],
		urls: any[],
		media?: MediaEntity[]
	},
	user: LegacyProfile,
	user_id_str: string,
	created_at: string,

	line?: boolean,
	quoted_status?: TweetInfo
	context_icon?: string,
	context_user?: string
};

type AppProps = {
	topProfile?: LegacyProfile,
	profiles?: LegacyProfile[],
	tweets?: TweetInfo[],
	tab: number
};

class Logic {
	updateFn: (AppProps) => void;
	history: string[];

	constructor(updateFn: (AppProps) => void) {
		this.updateFn = updateFn;
	}

	back() {
		window.history.back();
	}

	navigate(i: string) {
		window.history.pushState(i, "", "/"+i);
		this.navigateReal(i);
	}

	navigateReal(i: string) {

		let api_call: string;
		let tab = 0;
		let m: string[];
		if (i == "") {
			api_call = "everyone";
		}
		else if ((m = i.match(/thread\/(\d+)$/)) !== null) {
			api_call = i; // easy
		}
		else if ((m = i.match(/followers\/(\d+)$/)) !== null) {
			api_call = i; // easy
		}
		else if ((m = i.match(/profile\/(\d+)$/)) !== null) {
			api_call = `profile/${m[1]}`;
			tab = 0;
		}
		else if ((m = i.match(/profile\/(\d+)\/with_replies$/)) !== null) {
			api_call = `replies/${m[1]}`;
			tab = 1;
		}
		else if ((m = i.match(/profile\/(\d+)\/media$/)) !== null) {
			api_call = `media/${m[1]}`;
			tab = 2;
		}
		else if ((m = i.match(/profile\/(\d+)\/likes$/)) !== null) {
			api_call = `likes/${m[1]}`;
			tab = 3;
		}
		else if ((m = i.match(/profile\/(\d+)\/bookmarks$/)) !== null) {
			api_call = `bookmarks/${m[1]}`;
			tab = 4;
		}
		else {
			api_call = i; // fall-back
		}

		let self = this;
		fetch('/api/'+api_call).then((response) =>
			response.json().then((data) => {
				data["tab"] = tab;
				self.updateFn(data)
			})
		);
	}
}

type TweetProps = {
	t: TweetInfo,
	u: LegacyProfile
}

type ProfileProps = {
	p: LegacyProfile
}

let TweetActions = (props: {t: TweetInfo}) =>
	<div class="t20230403-actions">
		<div class="t20230403-action-item-outer t20230403-action-reply"><div tabIndex={0} class="t20230403-action-item-inner">
			<svg class="t20230403-action-icon" viewBox="0 0 24 24"><g><path d="M1.751 10c0-4.42 3.584-8 8.005-8h4.366c4.49 0 8.129 3.64 8.129 8.13 0 2.96-1.607 5.68-4.196 7.11l-8.054 4.46v-3.69h-.067c-4.49.1-8.183-3.51-8.183-8.01zm8.005-6c-3.317 0-6.005 2.69-6.005 6 0 3.37 2.77 6.08 6.138 6.01l.351-.01h1.761v2.3l5.087-2.81c1.951-1.08 3.163-3.13 3.163-5.36 0-3.39-2.744-6.13-6.129-6.13H9.756z"></path></g></svg>
			<span class="t20230403-action-text"><span>{props.t.reply_count == "0" ? "" : props.t.reply_count}</span></span>
		</div></div>
		<div class="t20230403-action-item-outer t20230403-action-rt"><div tabIndex={0} class="t20230403-action-item-inner">
			<svg class="t20230403-action-icon" viewBox="0 0 24 24"><g><path d="M4.75 3.79l4.603 4.3-1.706 1.82L6 8.38v7.37c0 .97.784 1.75 1.75 1.75H13V20H7.75c-2.347 0-4.25-1.9-4.25-4.25V8.38L1.853 9.91.147 8.09l4.603-4.3zm11.5 2.71H11V4h5.25c2.347 0 4.25 1.9 4.25 4.25v7.37l1.647-1.53 1.706 1.82-4.603 4.3-4.603-4.3 1.706-1.82L18 15.62V8.25c0-.97-.784-1.75-1.75-1.75z"></path></g></svg>
			<span class="t20230403-action-text"><span>{props.t.retweet_count == "0" ? "" : props.t.retweet_count}</span></span>
		</div></div>
		<div class="t20230403-action-item-outer t20230403-action-like"><div tabIndex={0} class="t20230403-action-item-inner">
			<svg class="t20230403-action-icon inactive-icon" viewBox="0 0 24 24"><g><path d="M16.697 5.5c-1.222-.06-2.679.51-3.89 2.16l-.805 1.09-.806-1.09C9.984 6.01 8.526 5.44 7.304 5.5c-1.243.07-2.349.78-2.91 1.91-.552 1.12-.633 2.78.479 4.82 1.074 1.97 3.257 4.27 7.129 6.61 3.87-2.34 6.052-4.64 7.126-6.61 1.111-2.04 1.03-3.7.477-4.82-.561-1.13-1.666-1.84-2.908-1.91zm4.187 7.69c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z"></path></g></svg>
			<svg class="t20230403-action-icon active-icon" viewBox="0 0 24 24"><g><path d="M20.884 13.19c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z"></path></g></svg>
			<span class="t20230403-action-text"><span>{props.t.favorite_count == "0" ? "" : props.t.favorite_count}</span></span>
		</div></div>
		{false ? <div class="t20230403-action-item-outer t20230403-action-views"><div tabIndex={0} class="t20230403-action-item-inner">
			<svg class="t20230403-action-icon" viewBox="0 0 24 24"><g><path d="M8.75 21V3h2v18h-2zM18 21V8.5h2V21h-2zM4 21l.004-10h2L6 21H4zm9.248 0v-7h2v7h-2z"></path></g></svg>
			<span class="t20230403-action-text"><span>10</span></span>
		</div></div> : []}
		<div class="t20230403-action-item-outer t20230403-action-share"><div tabIndex={0} class="t20230403-action-item-inner">
			<svg class="t20230403-action-icon" viewBox="0 0 24 24"><g><path d="M12 2.59l5.7 5.7-1.41 1.42L13 6.41V16h-2V6.41l-3.3 3.3-1.41-1.42L12 2.59zM21 15l-.02 3.51c0 1.38-1.12 2.49-2.5 2.49H5.5C4.11 21 3 19.88 3 18.5V15h2v3.5c0 .28.22.5.5.5h12.98c.28 0 .5-.22.5-.5L19 15h2z"></path></g></svg>
		</div></div>
	</div>;

let MediaGrid = (props: {items: VNode<any>[]}) => {
	let items = props.items;
	return <div class="t20230624-embed-rounded-corners">
		<div class="t20230624-media-relative">
			<div class="t20230624-media-aspect-keeper"></div>
			{
				items.length == 0 ? [] :
				items.length == 1 ? items[0] :
				items.length == 2 ?
					<div class="t20230701-media-hdiv">{items}</div> :
				items.length == 3 ?
					<div class="t20230701-media-hdiv">
						{items[0]}
						<div class="t20230701-media-vdiv">{[items[1], items[2]]}</div>
					</div>
				:
					<div class="t20230701-media-hdiv">
						<div class="t20230701-media-vdiv">{[items[0], items[1]]}</div>
						<div class="t20230701-media-vdiv">{[items[2], items[3]]}</div>
					</div>

			}
		</div>
	</div>
};

let TweetImage = (props: {src: string}) =>
	<div class="t20230624-image-div" style={{"background-image": `url('${props.src}')`}}></div>; /*todo: proper escape*/

let dateFormat = (datestr: string) => {
	let now = new Date();
	let date = new Date(datestr);
	let deltaSec = (now.getTime() - date.getTime()) / 1000;

	let months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

	if (deltaSec < 60)
		return "now";
	if (deltaSec < 60 * 60)
		return `${Math.floor(deltaSec/60)}m`
	if (deltaSec < 24 * 60 * 60)
		return `${Math.floor(deltaSec/60/24)}h`

	if (now.getFullYear() != date.getFullYear())
		return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
	return `${months[date.getMonth()]} ${date.getDate()}`;
};

let Tweet = (props: TweetProps) => {
	let t = props.t;
	let id_str = props.t.id_str;
	let user_id_str = props.t.user_id_str;
	let selectTweet = (e: JSX.TargetedMouseEvent<HTMLElement>) => {
		e.preventDefault();
		logic.navigate("thread/"+id_str);
	};
	let selectUser = (e: JSX.TargetedMouseEvent<HTMLAnchorElement>) => {
		e.preventDefault();
		e.stopPropagation();
		logic.navigate("profile/"+user_id_str);
	};
	let dumpTweet = (e: JSX.TargetedMouseEvent<HTMLAnchorElement>) => {
		e.preventDefault();
		console.log(t);
	};
	// let userPath = "/"+props.u.screen_name;
	let userPath = "/profile/"+user_id_str;

	let embeds = [];
	if (props.t.entities !== undefined && props.t.entities.media !== undefined) {
		let items = props.t.entities.media.map((media) => <TweetImage src={media.media_url_https}/>);
		embeds.push(<MediaGrid items={items}/>);
	}
	if (t.quoted_status)
		embeds.push(<QuotedTweet t={t.quoted_status} u={t.quoted_status.user}/>);

	return <div class="t20230403-tweet t20230403-tweet-unfocused" tabIndex={0} onClick={selectTweet}>
		{t.context_icon ?
		<div class="t20230403-tweet-split t20230705-tweet-context">
			<div class="t20230403-avatar-column">
				{ t.context_icon == "retweet"
				? <svg class="t20230706-context-icon" viewBox="0 0 24 24" aria-hidden="true"><g><path d="M4.75 3.79l4.603 4.3-1.706 1.82L6 8.38v7.37c0 .97.784 1.75 1.75 1.75H13V20H7.75c-2.347 0-4.25-1.9-4.25-4.25V8.38L1.853 9.91.147 8.09l4.603-4.3zm11.5 2.71H11V4h5.25c2.347 0 4.25 1.9 4.25 4.25v7.37l1.647-1.53 1.706 1.82-4.603 4.3-4.603-4.3 1.706-1.82L18 15.62V8.25c0-.97-.784-1.75-1.75-1.75z"></path></g></svg>
				: <span>{t.context_icon}</span>}
			</div>
			<div class="t20230403-main-column">
				{t.context_user} Retweeted
			</div>
		</div>
		: []}
		<div class="t20230403-tweet-split">
			<div class="t20230403-avatar-column">
				<a href={userPath} onClick={selectUser}>
					<div class="t20230403-avatar-box">
						<img alt="" draggable={true} src={props.u.profile_image_url_https} class="t20230403-avatar"/>
					</div>
				</a>
				{t.line ? <div class="t20230624-thread-line-below"></div> : []}
			</div>
			<div class="t20230403-main-column">
				<div class="t20230403-user-line">
					<a class="t20230403-user-line-displayname" href={userPath} onClick={selectUser}>{props.u.name}</a>
					<a class="t20230403-user-line-handle" href={userPath} onClick={selectUser} tabIndex={-1}>@{props.u.screen_name}</a>
					<span class="t20230403-user-line-punctuation">·</span>
					<a class="t20230403-user-line-time" href={`https://twitter.com/${props.u.screen_name}/status/${props.t.id_str}`} onClick={dumpTweet}>{dateFormat(props.t.created_at)}</a>
					<span class="t20230403-user-line-menu"></span>
				</div>
				<div class="t20230403-contents">{props.t.full_text}</div>
				{embeds && <div class="t20230624-embeds">{embeds}</div>}
				<TweetActions t={props.t}/>
			</div>
		</div>
	</div>;
};

let QuotedTweet = (props: TweetProps) => {
	let userPath = "/"+props.u.screen_name;
	return <div class="t20230624-embed-rounded-corners">
		<div class="t20230630-qrt-top">
			<div class="t20230403-user-line">
				<a class="t20230403-user-line-displayname" href={userPath}>{props.u.name}</a>
				<a class="t20230403-user-line-handle" href={userPath} tabIndex={-1}>@{props.u.screen_name}</a>
				<span class="t20230403-user-line-punctuation">·</span>
				<a class="t20230403-user-line-time" href={`https://twitter.com/${props.u.screen_name}/status/${props.t.id_str}`}>{dateFormat(props.t.created_at)}</a>
			</div>
		</div>
		<div class="t20230630-qrt-bottom t20230403-contents">
			{props.t.full_text}
		</div>
	</div>;
}

let ProfileItem = (props: ProfileProps) => {
	let p = props.p;
	let user_id_str = p.user_id_str;
	let selectUser = (e: JSX.TargetedMouseEvent<HTMLAnchorElement>) => {
		e.preventDefault();
		logic.navigate("profile/"+user_id_str);
	};
	let userPath = "/"+p.screen_name;
	return <div class="t20230627-profile-li">
		<div class="t20230403-avatar-column">
			<a href={userPath} onClick={selectUser}>
				<div class="t20230403-avatar-box">
					<img alt="" draggable={true} src={p.profile_image_url_https} class="t20230403-avatar"/>
				</div>
			</a>
		</div>
		<div class="t20230403-main-column">
			<div class="t20230627-profile-li-header">
				<a href={userPath} onClick={selectUser} class="t20230627-profile-li-header-1">
					<div class="t20230403-user-line-displayname">
						{p.name}
					</div>
					{p.protected
						? <svg class="t20230627-padlock" viewBox="0 0 24 24" aria-label="Protected account" role="img" data-testid="icon-lock"><g><path d="M17.5 7H17v-.25c0-2.76-2.24-5-5-5s-5 2.24-5 5V7h-.5C5.12 7 4 8.12 4 9.5v9C4 19.88 5.12 21 6.5 21h11c1.39 0 2.5-1.12 2.5-2.5v-9C20 8.12 18.89 7 17.5 7zM13 14.73V17h-2v-2.27c-.59-.34-1-.99-1-1.73 0-1.1.9-2 2-2 1.11 0 2 .9 2 2 0 .74-.4 1.39-1 1.73zM15 7H9v-.25c0-1.66 1.35-3 3-3 1.66 0 3 1.34 3 3V7z"></path></g></svg>
						: []}
				</a>
				<div class="t20230627-profile-li-header-2">
					<span class="t20230403-user-line-handle">@{p.screen_name}</span>
					{p.followed_by ? <span class="t20230627-profile-badge">Follows you</span> : []}
				</div>
			</div>
			<div class="t20230627-profile-li-bio t20230403-contents">
				{p.description}
			</div>
		</div>
	</div>;
};

let Profile2 = (p: LegacyProfile) =>
	<div class="t20230627-profile">
		<a class="t20230627-profile-banner">
			<img src={p.profile_banner_url} draggable={true}/>
		</a>
		<div class="t20230627-profile-info">
			<div class="t20230627-profile-picture-and-actions">
				<div class="t20230627-profile-picture">
						<div class="t20230627-profile-picture-square-aspect"></div>
						<div class="t20230627-profile-picture-outer-rim"></div>
						<img alt="Opens profile photo" draggable={true} src={p.profile_image_url_https ? p.profile_image_url_https.replace("normal", "200x200") : ""}/>
				</div>
			</div>
			<div class="t20230627-profile-title">
				<div class="t20230627-profile-li-header">
					<a href="#" class="t20230627-profile-li-header-1">
						<div class="t20230403-user-line-displayname">
							{p.name}
						</div>
						{p.protected
							? <svg class="t20230627-padlock" viewBox="0 0 24 24" aria-label="Protected account" role="img" data-testid="icon-lock"><g><path d="M17.5 7H17v-.25c0-2.76-2.24-5-5-5s-5 2.24-5 5V7h-.5C5.12 7 4 8.12 4 9.5v9C4 19.88 5.12 21 6.5 21h11c1.39 0 2.5-1.12 2.5-2.5v-9C20 8.12 18.89 7 17.5 7zM13 14.73V17h-2v-2.27c-.59-.34-1-.99-1-1.73 0-1.1.9-2 2-2 1.11 0 2 .9 2 2 0 .74-.4 1.39-1 1.73zM15 7H9v-.25c0-1.66 1.35-3 3-3 1.66 0 3 1.34 3 3V7z"></path></g></svg>
							: []}
					</a>
					<div class="t20230627-profile-li-header-2">
						<span class="t20230403-user-line-handle">@{p.screen_name}</span>
						{p.followed_by ? <span class="t20230627-profile-badge">Follows you</span> : []}
					</div>
				</div>
			</div>
			<div class="t20230627-profile-description">
				{p.description}
			</div>
			<div class="t20230627-profile-attributes">
			</div>
			<div class="t20230627-profile-numbers">
			</div>
			<div class="t20230627-profile-context">
			</div>
		</div>
	</div>

let Profile = (props: ProfileProps) => Profile2(props.p);

let Header = (props: {}) =>
	<div class="t20230628-timeline-header">
		<div class="t20230628-timeline-header-profile">
			<div class="t20230628-timeline-header-return-button">
				<div class="t20230628-timeline-header-button" onClick={logic.back.bind(logic)}>
					<svg viewBox="0 0 24 24" aria-hidden="true" style="color: rgb(239, 243, 244);"><g><path d="M7.414 13l5.043 5.04-1.414 1.42L3.586 12l7.457-7.46 1.414 1.42L7.414 11H21v2H7.414z"></path></g></svg>
				</div>
			</div>
		</div>
	</div>;

type NavBarProps = {
	items: string[],
	selected: number,
	onClick: (number) => void
}

let NavBar = (props: NavBarProps) =>
	<div class="t20230630-navbar">
		{props.items.map((name, index) =>
			<div class={"t20230630-navbutton" + (index == props.selected ? " navbar-selected" : "")} onClick={(e) => props.onClick(index)}>
				<div class="t20230630-navbutton-text">{name}</div>
			</div>
		)}
	</div>;

class App extends Component<AppProps> {
	render() {
		let top = this.props.topProfile;
		let selectTab = (index: number) => {
			let uid = this.props.topProfile.user_id_str;
			let url: string = [
				`profile/${uid}`,
				`profile/${uid}/with_replies`,
				`profile/${uid}/media`,
				`profile/${uid}/likes`,
				`profile/${uid}/bookmarks`
			][index];
			logic.navigate(url)
		};
		return <>
			<Header/>
			{top ? <>
				<Profile p={top}/>
				<NavBar items={["Tweets", "Replies", "Media", "Likes", "Bookmarks"]} selected={this.props.tab} onClick={selectTab}/>
			</> : [] }
			{(this.props.profiles || []).map(profile => <ProfileItem p={profile}/>)}
			{(this.props.tweets || []).map(tweet => <Tweet t={tweet} u={tweet.user}/>)}
		</>;
	}
}

let div = null;
let logic = new Logic((props) => render(h(App, props), div));
window.addEventListener("popstate", (event) => logic.navigateReal(window.location.pathname.slice(1)));
window.addEventListener("load", () => {
	div = document.getElementById("timeline0");
	render(<App tweets={[]} tab={0}/>, div);
	logic.navigateReal(window.location.pathname.slice(1));
});
