package de.featjar.varied;

import org.eclipse.jetty.server.Server;
import org.eclipse.jetty.server.ServerConnector;
import org.eclipse.jetty.servlet.ServletContextHandler;
import org.eclipse.jetty.servlet.ServletHolder;
import org.eclipse.jetty.websocket.javax.server.config.JavaxWebSocketServletContainerInitializer;

import java.awt.*;
import java.net.URI;

public class Main {
    private static final Server server = new Server();
    private static final ServerConnector serverConnector = new ServerConnector(server);

    public static void main(String[] args) throws Exception {
        int port = args.length > 0 ? Integer.parseInt(args[0]) : 8080;
        serverConnector.setPort(port);
        server.addConnector(serverConnector);
        ServletContextHandler context = new ServletContextHandler(ServletContextHandler.SESSIONS);
        context.addServlet(new ServletHolder(new Home()), "/");
        JavaxWebSocketServletContainerInitializer.configure(context,
                (servletContext, wsContainer) -> {
                    wsContainer.setDefaultMaxSessionIdleTimeout(0);
                    wsContainer.addEndpoint(Socket.class);
                });
        server.setHandler(context);
        server.start();
        Desktop.getDesktop().browse(new URI("http://localhost:" + port));
        server.join();
    }
}