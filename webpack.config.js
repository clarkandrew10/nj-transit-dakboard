import CopyWebpackPlugin from "copy-webpack-plugin";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const config = {
	entry: "./index.js",
	target: "node",
	module: {
		rules: [
			{
				test: /\.js$/,
				loader: "babel-loader",
				include: __dirname,
				exclude: /node_modules/,
			},
		],
	},
	output: {
		libraryTarget: "commonjs",
		path: __dirname + "/.webpack",
		filename: "index.js",
	},
	externals: {
		"chrome-aws-lambda": "chrome-aws-lambda",
		lambdafs: "lambdafs",
		"aws-sdk": "aws-sdk",
		"chrome-aws-lambda": "chrome-aws-lambda",
	},

	plugins: [
		new CopyWebpackPlugin({
			patterns: [
				{
					from: "node_modules/chrome-aws-lambda",
					to: "node_modules/chrome-aws-lambda",
				},
				{ from: "node_modules/lambdafs", to: "node_modules/lambdafs" },
			],
		}),
	],
};

export default config;
