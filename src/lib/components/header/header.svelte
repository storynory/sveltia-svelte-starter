<nav class="txt-right page -p bg-white">
	<a href="/">Home</a> /
	<a href="/pages/about/">About / </a>
	<a href="/search/">Search / </a>
	<a href="/books/">Books</a>
</nav>

<header class="h1 bg-prime txt-center txt-light">
	<a class="txt-white brand" href="/">Philosophy</a>
	<span class="oval-thought circle it">24/7</span>
</header>

<style>
	a.brand:hover {
		color: white;
	}

	.oval-thought {
		font-size: 0.75em;
		position: relative;
		padding-right: 1em;
		color: var(--frog-dark);
		background-color: ivory;
		border-radius: 180px;
		padding: 0.25em 1em;
		font-style: italic;
	}

	.oval-thought:after,
	.oval-thought:before {
		display: block;
		content: '';
		position: absolute;
		background-color: ivory;
		border-radius: 30px;
		bottom: -23px;
		left: 1.6em;
		width: 30px;
		height: 30px;
	}

	.oval-thought:after {
		bottom: -25px;
		left: 1em;
		width: 15px;
		height: 15px;
		border-radius: 15px;
	}

	.circle {
		border-radius: 360px;
	}
	/*
.strap {
    position: relative;
    font-size: 85%;
    font-style: italic;
    margin-bottom: 1em;
}
*/

	@media (max-width: 600px) {
		.oval-thought {
			display: block;
			max-width: 200px;
			margin: auto;
		}

		.oval-thought:after,
		.oval-thought:before {
			bottom: -20px;
			left: 1.6em;
			width: 25px;
			height: 25px;
		}

		.oval-thought:after {
			bottom: -25px;
			left: 1em;
			width: 10px;
			height: 10px;
			border-radius: 15px;
		}
	}

	@media (max-width: 480px) {
		.oval-thought {
			display: block;
			max-width: 200px;
			margin: auto;
			max-width: 120px;
		}

		.oval-thought:after,
		.oval-thought:before {
			bottom: -20px;
			left: 1.6em;
			width: 20px;
			height: 20px;
		}

		.oval-thought:after {
			bottom: -25px;
			left: 1em;
			width: 10px;
			height: 10px;
			border-radius: 15px;
		}
	}
</style>
