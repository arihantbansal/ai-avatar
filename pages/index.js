import Head from "next/head";
import Image from "next/image";
import buildspaceLogo from "../assets/buildspace-logo.png";
import { useState, useEffect } from "react";

const Home = () => {
	const maxRetries = 20;
	const [input, setInput] = useState("");
	const [img, setImg] = useState("");
	const [retry, setRetry] = useState(0);
	const [retryCount, setRetryCount] = useState(maxRetries);
	const [isGenerating, setIsGenerating] = useState(false);

	const onChange = (e) => {
		setInput(e.target.value);
	};

	const generateAction = async () => {
		console.log("beep boop\tGenerating...");

		if (isGenerating && retry === 0) return;
		setIsGenerating(true);

		if (retry > 0) {
			setRetryCount((prevState) => {
				if (prevState == 0) {
					return 0;
				} else {
					return prevState - 1;
				}
			});

			setRetry(0);
		}

		const response = await fetch("/api/generate", {
			method: "POST",
			headers: {
				"Content-Type": "image/jpeg",
			},
			body: JSON.stringify({ input }),
		});

		const data = await response.json();

		if (response.status === 503) {
			setRetry(data.estimated_time);
			setIsGenerating(false);
			return;
		}

		if (!response.ok) {
			console.log("Error: ${data.error}");
			return;
		}

		setImg(data.image);
		setIsGenerating(false);
	};

	const sleep = (ms) => {
		return new Promise((resolve) => setTimeout(resolve, ms));
	};

	useEffect(() => {
		const runRetry = async () => {
			if (retryCount == 0) {
				console.log(
					`Model still loading after ${maxRetries} retries. Try again in 5 minutes.`
				);
				setRetryCount(maxRetries);
				return;
			}

			console.log(`Trying again in ${retry} seconds...`);

			await sleep(retry * 1000);
			await generateAction();
		};

		if (retry === 0) {
			return;
		}

		runRetry();
	}, [retry]);

	return (
		<div className="root">
			<Head>
				<title>Silly Picture Generator</title>
			</Head>
			<div className="container">
				<div className="header">
					<div className="header-title">
						<h1>silly picture generator</h1>
					</div>
					<div className="header-subtitle">
						<h2>
							Turn me into anyone you want! Make sure you refer to me as
							"ariban" in the prompt
						</h2>
					</div>
					<div className="prompt-container">
						<input
							type="text"
							className="prompt-box"
							value={input}
							onChange={onChange}
						/>
						<div className="prompt-buttons">
							<a href="" className="generate-button" onClick={generateAction}>
								<div className="generate">
									<p>Generate</p>
								</div>
							</a>
						</div>
					</div>
				</div>
			</div>
			<div className="badge-container grow">
				<a
					href="https://buildspace.so/builds/ai-avatar"
					target="_blank"
					rel="noreferrer">
					<div className="badge">
						<Image src={buildspaceLogo} alt="buildspace logo" />
						<p>build with buildspace</p>
					</div>
				</a>
			</div>
		</div>
	);
};

export default Home;

