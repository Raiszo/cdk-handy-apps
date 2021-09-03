import * as cdk from '@aws-cdk/core'
import { SubnetType, Vpc } from '@aws-cdk/aws-ec2'

export class VpcStack extends cdk.Stack {
	constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
		super(scope, id, props)

		new Vpc(this, 'vpc', {
			maxAzs: 2,
			subnetConfiguration: [
				{
					name: 'public',
					cidrMask: 24,
					subnetType: SubnetType.PUBLIC
				},
				{
					name: 'database',
					cidrMask: 24,
					subnetType: SubnetType.ISOLATED,
				}
			],
		})
	}
}
