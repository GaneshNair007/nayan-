"""Stop all test-started inference workers before interpreter shutdown."""
import threading
import pytest

@pytest.fixture(scope='session', autouse=True)
def stop_inference_workers_after_suite():
    yield
    # Repeated scenarios can replace a camera's manager entry while its previous
    # daemon is still finishing. Include those workers in test teardown too.
    workers = [t for t in threading.enumerate()
               if getattr(getattr(t, '_target', None), '__name__', '') == '_run_job_worker']
    for worker in workers:
        worker._args[0].stop_requested = True
    for worker in workers:
        worker.join(timeout=30)
        assert not worker.is_alive(), 'Inference worker did not stop after tests'
