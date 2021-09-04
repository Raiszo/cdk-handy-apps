#!/usr/bin/env node
// -*- mode: typescript -*-
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { VpcStack } from '../lib/networking-stack';

const app = new cdk.App();
new VpcStack(app, 'vpc-TEST', {
	tags: {
		'app:environment': 'test'
	}
})

new VpcStack(app, 'vpc-PROD', {
	tags: {
		'app:environment': 'prod'
	}
})
