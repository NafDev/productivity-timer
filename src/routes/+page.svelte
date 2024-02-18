<script lang="ts">
	import {
		add,
		differenceInMilliseconds,
		differenceInSeconds,
		intervalToDuration,
		subMilliseconds,
		type Interval
	} from 'date-fns';
	import { onMount } from 'svelte';

	enum TimerPhase {
		START = "Be productive for as long as you're able to. When you feel your concentration has slipped, you can take a break for a fifth of the time you've spent being productive.",
		WORKING = "You've been productive for:",
		RESTING = 'Break ends in:'
	}

	enum TimerState {
		STOPPED,
		RUNNING
	}

	const INTERVAL_MS = 200;
	const BREAK_MULTIPLIER = 0.2;

	let state: TimerState = TimerState.STOPPED;
	let phase: TimerPhase = TimerPhase.START;

	let timerStart: Date;
	let timerValue: Date;
	let timerIntervalId: number;
	$: interval = { start: timerStart, end: timerValue } as Interval;
	$: timer = getFormattedTimer(interval);

	function resetFlow() {
		clearInterval(timerIntervalId);
		state = TimerState.STOPPED;
		phase = TimerPhase.START;
		timerStart = new Date();
		timerValue = timerStart;
	}

	const timerZeroed = new Event('timer:zeroed');
	onMount(() => {
		window.addEventListener('timer:zeroed', () => {
			resetFlow(); // new Notification('Break has finished!', { body: 'Restart your productivity timer now' });
			if (Notification.permission === 'granted') {
				const n = new Notification('Break has finished!');
				console.log(n);
				n.addEventListener('show', () => {
					console.log('times up');
				});
			}
		});

		if (Notification.permission !== 'granted') {
			Notification.requestPermission().then((result) => {
				if (result !== 'granted') {
					// Some toast about recommending notifs for rest timers
				}
			});
		}
	});

	function startCountUpTimer() {
		clearInterval(timerIntervalId);
		timerStart = new Date();
		timerValue = new Date();
		timerIntervalId = setInterval(() => {
			timerValue = new Date();
		}, INTERVAL_MS);
	}

	function startCountDownTimer(fromSeconds: number) {
		clearInterval(timerIntervalId);

		timerStart = new Date();
		timerValue = add(timerStart, { seconds: fromSeconds });

		timerIntervalId = setInterval(() => {
			let msSinceStart = differenceInMilliseconds(new Date(), timerStart);
			interval = { start: timerStart, end: subMilliseconds(timerValue, msSinceStart) };

			if (differenceInMilliseconds(interval.end, interval.start) < 400) {
				console.log(differenceInMilliseconds(interval.start, interval.end));
				dispatchEvent(timerZeroed);
			}
		}, INTERVAL_MS);
	}

	function getFormattedTimer(interval: Interval) {
		const duration = intervalToDuration(interval);
		const hours = duration.hours ? padTimeSegment(duration.hours) + ':' : '';
		return `${hours}${padTimeSegment(duration.minutes)}:${padTimeSegment(duration.seconds)}`;
	}

	function padTimeSegment(seg: number | undefined) {
		return (seg ?? 0).toString().padStart(2, '0');
	}

	function startWorkingTimer() {
		startCountUpTimer();
		phase = TimerPhase.WORKING;
		state = TimerState.RUNNING;
	}

	function startRestTimer() {
		startCountDownTimer(differenceInSeconds(new Date(), timerStart) * BREAK_MULTIPLIER);
		phase = TimerPhase.RESTING;
		state = TimerState.RUNNING;
	}
</script>

<div class="mx-auto flex flex-col items-center justify-center px-5">
	<h1 class="text-center">{phase}</h1>

	{#if state === TimerState.RUNNING}
		<p>{timer}</p>
	{/if}

	<div class="mt-2 flex flex-col gap-2">
		{#if state === TimerState.STOPPED && phase !== TimerPhase.RESTING}
			<button class="btn primary" on:click={startWorkingTimer}>Start productivity</button>
		{:else if state === TimerState.RUNNING && phase === TimerPhase.WORKING}
			<button class="btn primary" on:click={startRestTimer}>Take a break</button>
		{/if}

		{#if phase !== TimerPhase.START}
			<button class="btn primary" on:click={resetFlow}>Reset</button>
		{/if}
	</div>
</div>
