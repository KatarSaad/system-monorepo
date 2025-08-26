FROM verdaccio/verdaccio:5

# Copy configuration
COPY verdaccio-config.yaml /verdaccio/conf/config.yaml

# Expose port
EXPOSE 4873

# Start verdaccio
CMD ["verdaccio", "--config", "/verdaccio/conf/config.yaml", "--listen", "0.0.0.0:4873"]