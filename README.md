# Html page for URL zero trust list

This worker script fetches a particular list of URLs and displays them in a html list.

The original use case was to allow only a specific list of Youtube videos and block everything else. But this code can be leveraged for many other use cases, where we want to make visible some information from a zero trust list.

To set up the Worker correctly define the API user and key using Workers Secrets and add the list id as a variable in wrangler.toml