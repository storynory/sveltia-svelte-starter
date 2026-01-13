<script lang="ts">
	import Speaker from '$lib/icons/iconSpeaker.svelte';
	//	import Podcast from '$lib/icons/iconPodcast.svelte';
	import IconReplay from '$lib/icons/iconReplay10.svelte';

	//	let { mp3 }: { mp3: string | undefined } = $props();
	// mp3 = stem + mp3;
	let props = $props<{ mp3?: string }>();

	// use props.mp3 everywhere

	// ✅ Force HTTPS if needed
	if (props.mp3 && props.mp3.startsWith('http://')) {
		props.mp3 = props.mp3.replace(/^http:\/\//i, 'https://');
	}

	let fileName: string = $state('');
	if (props.mp3) {
		// Works with full URLs like https://traffic.libsyn.com/blogrelations/filename.mp3
		fileName = props.mp3.split('/').pop() ?? '';
	}

	// Type the audio element reference
	let audio: HTMLAudioElement | undefined = $state();
	let isActive: boolean = $state(false);

	// State variables with explicit types
	let playclass: 'paused' | 'play' | '' = $state('');
	let range: number = $state(0);
	let dur: string = $state('0:00'); // Duration as formatted string
	let status: string = $state('get ready');
	let currentSeconds: number = $state(0);
	let currentTime: string = $state('0:00');

	// Handle range input change
	function onRangeChange(event: Event): void {
		const target = event.target as HTMLInputElement;
		const percentage = parseInt(target.value) / 100;
		if (audio && !isNaN(audio.duration)) {
			const newTime = percentage * audio.duration;
			audio.currentTime = newTime;
			currentSeconds = newTime;
			currentTime = HHMMSS(newTime);
		}
	}

	// Update time display and range
	function setTime(): void {
		if (audio) {
			currentSeconds = audio.currentTime;
			currentTime = HHMMSS(currentSeconds);
			range = audio.duration ? Math.round((currentSeconds / audio.duration) * 100) : 0;
		}
	}

	// Format seconds to HH:MM:SS
	function HHMMSS(seconds: number): string {
		const hrs = Math.floor(seconds / 3600);
		const mins = Math.floor((seconds % 3600) / 60);
		const secs = Math.floor(seconds % 60);
		return [
			hrs > 0 ? hrs.toString().padStart(2, '0') : null,
			mins.toString().padStart(2, '0'),
			secs.toString().padStart(2, '0')
		]
			.filter(Boolean)
			.join(':');
	}

	// Event handlers
	function onCanPlay(): void {
		status = 'Loading';
	}

	function onCanPlayThrough(): void {
		status = 'Loaded';
	}

	function onLoadedMetadata(): void {
		if (audio) {
			dur = HHMMSS(audio.duration);
		}
	}

	// add this guard
	let hasSrc: boolean = $state(false);

	function play(): void {
		if (!audio) return;

		isActive = true;

		if (!hasSrc && props.mp3) {
			audio.src = props.mp3;
			audio.preload = 'none';
			hasSrc = true;
			status = 'Loading…';
		}

		if (audio.paused) {
			playclass = 'paused';
			audio.play().catch(() => (status = 'Tap to play'));
		} else {
			playclass = 'play';
			audio.pause();
		}
	}

	const JUMP_SECONDS = 10;

	function jump(seconds: number): void {
		if (!audio || isNaN(audio.duration)) return;

		const next = Math.min(audio.duration, Math.max(0, audio.currentTime + seconds));

		audio.currentTime = next;
		currentSeconds = next;
		currentTime = HHMMSS(next);
		range = Math.round((next / audio.duration) * 100);
	}

	function jumpBack(): void {
		jump(-JUMP_SECONDS);
	}

	function jumpForward(): void {
		jump(JUMP_SECONDS);
	}

	// keyboard play pause
	function onKeydown(e: KeyboardEvent): void {
		if (!isActive) return;
		// Ignore if modifier keys are held
		if (e.altKey || e.ctrlKey || e.metaKey) return;

		switch (e.key) {
			case ' ':
				e.preventDefault(); // stop page scroll
				play();
				break;

			case 'ArrowLeft':
				e.preventDefault();
				jumpBack();
				break;

			case 'ArrowRight':
				e.preventDefault();
				jumpForward();
				break;
		}
	}

	$effect(() => {
		document.addEventListener('keydown', onKeydown);
		return () => document.removeEventListener('keydown', onKeydown);
	});
</script>

<figure id="figure" class="player bg-frog-dark container -m-b -p">
	<div class="speaker {playclass}"><Speaker></Speaker></div>
	<button type="button" class="replay" onclick={jumpBack} aria-label="Jump back 15 seconds">
		<IconReplay></IconReplay>
	</button>

	<audio
		bind:this={audio}
		src={props.mp3}
		preload="metadata"
		onloadedmetadata={onLoadedMetadata}
		ontimeupdate={setTime}
		oncanplay={onCanPlay}
		oncanplaythrough={onCanPlayThrough}
		onerror={() => (status = 'Audio unavailable')}
	></audio>
	<label for="range">seek</label>
	<div class="playbtn">
		<button
			onclick={play}
			class="center {playclass}"
			name="audio_player"
			id="play"
			aria-label="Play or pause audio"
			data-umami-event={audio && audio.paused ? 'Audio Play' : undefined}
			data-umami-event-mp3={fileName || undefined}
		></button>
	</div>

	<input
		class="slider"
		type="range"
		id="range"
		min="0"
		max="100"
		value={range}
		oninput={onRangeChange}
	/>
	<label for="seek">seek</label>
	<span class="left" id="time">{currentTime}</span>
	<span class="right" id="dur">{dur}</span>
	<span>{status}</span>
</figure>
{#if props.mp3}
	<div class="links playerlinks">
		<a href={props.mp3}>Download</a>
		<!--	<span class="right podcast"><a href="/pages/podcast/">Subscribe to Podcast</a></span> -->
	</div>
{/if}

<style>
	figure.player,
	.links {
		position: relative;
		width: 90%;
		display: block;
		margin: auto auto 1em auto;
	}
	.links {
		font-size: 80%;
		padding: 0 0.25em;
	}

	figure.player {
		border-radius: 8px;
		font-size: 16px;
		text-align: center;
		overflow: hidden;
		color: #fff;
		margin-bottom: 0em;
	}

	.player label {
		position: absolute;
		left: -3000px;
	}

	.left {
		float: left;
	}

	.right {
		float: right;
	}

	.playbtn {
		width: 100%;
		text-align: center;
		height: 52px;
	}

	#range {
		width: 100%;
	}

	#play {
		border: 0;
		background: 0 0;
		box-sizing: border-box;
		width: 0;
		height: 48px;
		overflow: hidden;
		border-color: transparent transparent transparent #efd480;
		transition: 0.1s all ease;
		cursor: pointer;
		border-style: solid;
		border-width: 24px 0 24px 38px;
	}

	#play:hover {
		border-color: transparent transparent transparent #fff;
	}

	#play.paused {
		border-style: double;
		border-width: 0 0 0 38px;
	}

	#play:active {
		border-color: transparent transparent transparent #404040;
	}

	button#play:active {
		background-color: #00f;
	}
	button.replay {
		display: block;
		left: 10px;
		height: 32px;
		width: 32px;
	}
	#time {
		width: 60px;
		text-align: left;
	}

	#dur {
		float: right;
	}

	.slider {
		-webkit-appearance: none;
		appearance: none;
		width: 100%;
		height: 8px;
		background: #efd480;
		outline: 0;
		opacity: 0.7;
		-webkit-transition: 0.2s;
		transition: opacity 0.2s;
	}

	.slider:hover {
		opacity: 1;
	}

	.slider::-webkit-slider-thumb {
		-webkit-appearance: none;
		appearance: none;
		width: 16px;
		height: 16px;
		border-radius: 100%;
		background: #4caf50;
		cursor: pointer;
	}

	.slider::-moz-range-thumb {
		width: 12px;
		height: 12px;
		background: #4caf50;
		cursor: pointer;
	}

	.speaker {
		position: absolute;
		color: ivory;
		width: 40px;
		height: 40px;
		right: 10px;
	}

	.speaker.paused {
		animation-name: speak;
		animation-duration: 2s;
		animation-iteration-count: infinite;
		animation-direction: alternate;
	}
	@keyframes speak {
		from {
			color: var(--butter);
		}
		to {
			color: var(--frog);
		}
	}
</style>
