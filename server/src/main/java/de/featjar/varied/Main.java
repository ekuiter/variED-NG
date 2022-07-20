package de.featjar.varied;

import org.eclipse.jetty.server.Handler;
import org.eclipse.jetty.server.Server;
import org.eclipse.jetty.server.ServerConnector;
import org.eclipse.jetty.server.handler.HandlerList;
import org.eclipse.jetty.server.handler.HandlerWrapper;
import org.eclipse.jetty.server.handler.ResourceHandler;
import org.eclipse.jetty.servlet.DefaultServlet;
import org.eclipse.jetty.servlet.ServletContextHandler;
import org.eclipse.jetty.servlet.ServletHolder;
import org.eclipse.jetty.util.resource.Resource;
import org.eclipse.jetty.websocket.javax.server.config.JavaxWebSocketServletContainerInitializer;

import java.awt.*;
import java.net.MalformedURLException;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.URL;
import java.util.Arrays;
import java.util.Optional;

public class Main {
    private static final Server server = new Server();
    private static final ServerConnector serverConnector = new ServerConnector(server);

    public static void main(String[] args) throws Exception {
        int port = args.length > 0 ? Integer.parseInt(args[0]) : 8080;
        boolean noBrowse = args.length > 1 && args[1].equals("--no-browse");
        serverConnector.setPort(port);
        server.addConnector(serverConnector);
        server.setHandler(getServletContextHandler());
        server.start();
        if (!noBrowse)
            Desktop.getDesktop().browse(new URI("http://localhost:" + port));
        server.join();
    }

    public static Optional<URL> getResourceURL(String fileName) {
        return Optional.ofNullable(Main.class.getClassLoader().getResource(fileName));
    }

    public static Optional<Resource> getBaseResource() {
        return Optional.ofNullable(Main.class.getClassLoader().getResource("index.html")).map(url -> {
            try {
                String[] parts = url.toString().split("/");
                url = new URL(String.join("/", Arrays.copyOfRange(parts, 0, parts.length - 1)) + "/");
                return Resource.newResource(url.toURI());
            } catch (URISyntaxException | MalformedURLException e) {
                throw new RuntimeException(e);
            }
        });
    }

    private static ServletContextHandler getServletContextHandler() {
        ServletContextHandler servletContextHandler = new ServletContextHandler(ServletContextHandler.SESSIONS);
        getBaseResource().ifPresent(servletContextHandler::setBaseResource);
        servletContextHandler.addServlet(new ServletHolder("default", DefaultServlet.class),"/");
        JavaxWebSocketServletContainerInitializer.configure(servletContextHandler,
                (servletContext, wsContainer) -> {
                    wsContainer.setDefaultMaxSessionIdleTimeout(0);
                    wsContainer.addEndpoint(Socket.class);
                });
        return servletContextHandler;
    }
}