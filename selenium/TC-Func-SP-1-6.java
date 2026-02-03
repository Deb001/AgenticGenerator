import org.openqa.selenium.*;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.support.ui.*;
import org.testng.Assert;
import org.testng.annotations.*;
import java.time.Duration;

public class TC_Func_SP_1_6_Test {
    private WebDriver driver;
    private WebDriverWait wait;

    @BeforeMethod
    public void setUp() {
        driver = new ChromeDriver();
        driver.manage().window().maximize();
        wait = new WebDriverWait(driver, Duration.ofSeconds(15));
    }

    @AfterMethod
    public void tearDown() {
        if (driver != null) {
            driver.quit();
        }
    }

    @Test
    public void test_TC_Func_SP_1_6() {
        // Navigate to the application's login page
        driver.get("https://example.com/login"); // TODO: replace with actual login URL

        // Click the Google login button
        By googleLoginButton = By.cssSelector("[data-testid='TODO']"); // TODO: replace with actual selector
        wait.until(ExpectedConditions.elementToBeClickable(googleLoginButton)).click();

        // Switch to the Google consent window/tab
        String originalWindow = driver.getWindowHandle();
        wait.until(driver -> driver.getWindowHandles().size() > 1);
        for (String handle : driver.getWindowHandles()) {
            if (!handle.equals(originalWindow)) {
                driver.switchTo().window(handle);
                break;
            }
        }

        // Click the "Deny" button on the Google consent screen
        By denyButton = By.cssSelector("[data-testid='TODO']"); // TODO: replace with actual selector
        wait.until(ExpectedConditions.elementToBeClickable(denyButton)).click();

        // Close the consent window if it remains open and switch back to the original window
        try {
            driver.close();
        } catch (Exception e) {
            // Window may already be closed; ignore
        }
        driver.switchTo().window(originalWindow);

        // Verify that the login page is displayed with an authentication error message
        By errorMessageLocator = By.cssSelector("[data-testid='TODO']"); // TODO: replace with actual selector
        WebElement errorMessage = wait.until(ExpectedConditions.visibilityOfElementLocated(errorMessageLocator));
        Assert.assertTrue(errorMessage.isDisplayed(), "Authentication error message should be displayed");

        String errorText = errorMessage.getText().toLowerCase();
        Assert.assertTrue(
            errorText.contains("authentication error") || errorText.contains("denied"),
            "Error message should indicate authentication failure"
        );
    }
}