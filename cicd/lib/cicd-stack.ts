import { Artifact, Pipeline } from '@aws-cdk/aws-codepipeline';
import { CodeStarConnectionsSourceAction, ManualApprovalAction } from '@aws-cdk/aws-codepipeline-actions';
import { Bucket } from '@aws-cdk/aws-s3';
import * as cdk from '@aws-cdk/core';
import { ElasticBeanstalkDeployAction } from './elastic-beanstalk/deploy-action';

interface CicdStackProps extends cdk.StackProps {
	artifactBucketArn: string
	codeStarConnectionArn: string
	repo: {
		owner: string
		name: string
		branch: string
	}
	ebApplication: string

	testEnvironment: string
	prodEnvironment: string
}

export class CicdStack extends cdk.Stack {
	constructor(scope: cdk.Construct, id: string, props: CicdStackProps) {
		super(scope, id, props);

		const artifact_bucket = Bucket.fromBucketArn(this, 'artifact-bucket', props.artifactBucketArn)

		const source_artifact = new Artifact('source')

		const pipeline = new Pipeline(this, 'pipeline', {
			restartExecutionOnUpdate: false,
			artifactBucket: artifact_bucket,
		})

		let { owner, name, branch } = props.repo

		pipeline.addStage({
			stageName: 'Source',
			actions: [
				new CodeStarConnectionsSourceAction({
					actionName: 'github-source',
					connectionArn: props.codeStarConnectionArn,
					output: source_artifact,
					owner,
					repo: name,
					branch,
				})
			]
		})

		pipeline.addStage({
			stageName: 'Test',
			actions: [
				new ElasticBeanstalkDeployAction({
					actionName: 'test-deployment',
					applicationName: props.ebApplication,
					environmentName: props.testEnvironment,
					input: source_artifact
				}),
			]
		})

		pipeline.addStage({
			stageName: 'Prod',
			actions: [
				new ManualApprovalAction({
					actionName: 'approve-production',
					runOrder: 1,
				}),
				new ElasticBeanstalkDeployAction({
					actionName: 'prod-deployment',
					applicationName: props.ebApplication,
					environmentName: props.prodEnvironment,
					input: source_artifact,
					runOrder: 2,
				}),
			]
		})
	}
}
