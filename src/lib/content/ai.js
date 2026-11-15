/* eslint-disable */
// AI content. Task 4b builds the rest around these moved items (each takes 2 consecutive 30-min AI-build slots).
// Item shape: { id, text, url?, mins?, depth?, slots? } plus extra keys. IDs are content-based (<prefix>:<slug>) and must never change.

export const AIB_MOVED = [
  { id: 'aib:python-for-js', text: 'Stage 2 · Python for JS devs (the go-to FDE language): dicts, comprehensions, classes, files, JSON, CSV', url: 'https://docs.python.org/3/tutorial/', slots: 2 },
  { id: 'aib:pandas', text: 'Stage 2 · Python for data: pandas (load, filter, group, join)', url: 'https://pandas.pydata.org/docs/user_guide/10min.html', slots: 2 },
  { id: 'aib:aws', text: 'Stage 6 · AWS essentials: IAM, EC2, S3, Lambda, VPC basics', url: 'https://roadmap.sh/aws', slots: 2 },
  { id: 'aib:terraform', text: 'Stage 6 · Terraform: deploy a small app as infrastructure as code', url: 'https://developer.hashicorp.com/terraform/tutorials/aws-get-started', slots: 2 },
  { id: 'aib:containers', text: 'Stage 6 · Containers: Dockerize your flagship project; Kubernetes pods, deployments, services', url: 'https://kubernetes.io/docs/tutorials/kubernetes-basics/', slots: 2 },
  { id: 'aib:devops', text: 'Stage 6 · DevOps: CI/CD, environments, secrets, rollbacks. Add a deploy pipeline to your flagship project.', url: 'https://roadmap.sh/devops', slots: 2 },
];
