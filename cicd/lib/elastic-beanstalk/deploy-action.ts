import { Action } from "@aws-cdk/aws-codepipeline";
import * as codepipeline from '@aws-cdk/aws-codepipeline';
import { Construct } from "@aws-cdk/core";
import { PolicyStatement } from "@aws-cdk/aws-iam";

interface ElasticBeanstalkDeployActionProps extends codepipeline.CommonAwsActionProps {
	readonly applicationName: string
	readonly environmentName: string
	readonly input: codepipeline.Artifact;
}

export class ElasticBeanstalkDeployAction extends Action {
	protected readonly providedActionProperties: codepipeline.ActionProperties
	private readonly props: ElasticBeanstalkDeployActionProps

	constructor(props: ElasticBeanstalkDeployActionProps) {
		super()
		this.providedActionProperties = {
			...props,
			category: codepipeline.ActionCategory.DEPLOY,
			provider: 'ElasticBeanstalk',
			artifactBounds: {
				minInputs: 1,
				maxInputs: 1,
				minOutputs: 0,
				maxOutputs: 0,
			},
			inputs: [props.input]
		}
		this.props = props
	}

	/**
	 * Permissions for the role as suggested by the docs {@link https://docs.aws.amazon.com/codepipeline/latest/userguide/security-iam.html}
	 */
	protected bound(_scope: Construct, _stage: codepipeline.IStage, options: codepipeline.ActionBindOptions):
	codepipeline.ActionConfig {
		options.bucket.grantRead(options.role);
		options.role.addToPrincipalPolicy(new PolicyStatement({
			resources: ['*'],
			actions: [
				'elasticbeanstalk:*',
				'ec2:*',
				'elasticloadbalancing:*',
				'autoscaling:*',
				'cloudwatch:*',
				's3:*',
				'sns:*',
				'cloudformation:*',
				'rds:*',
				'sqs:*',
				'ecs:*',
				'logs:*',
			],
		}))

		return {
			configuration: {
				ApplicationName: this.props.applicationName,
				EnvironmentName: this.props.environmentName
			},
		};
	}
}
